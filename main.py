from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, validator
from auth_middleware import authenticate_token

# Supabase設定
SUPABASE_URL = "https://jroelrbrmifcsrwyzgka.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyb2VscmJybWlmY3Nyd3l6Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDk0MTgsImV4cCI6MjA3MTE4NTQxOH0.2D1pRTrutbhYy04sbVHzY7nHEnaIIQdGrEV832esP9o"

# Supabaseクライアントの初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


app = FastAPI()

# CORS設定を追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://todolis-6r4.pages.dev","https://taskel.net"],  # 特定のオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/api/spaces/add/")
async def create_group(title: str, members: List[str]): # Modified to accept title and members as individual parameters
    """
    supabaseを使用してランダムな閲覧トークンと編集トークンを持つ新しい目標共有グループを作成します。
    グループ情報を'spaces'テーブルに、メンバーを'space_members'テーブルに追加します。
    """
    try:
        # Generate unique IDs and tokens
        space_id = str(uuid.uuid4())
        view_token = str(uuid.uuid4())
        edit_token = str(uuid.uuid4())

        # Set the timezone to JST (GMT+9).
        jst = timezone(timedelta(hours=+9))
        # Get the current time in JST.
        now = datetime.now(jst)
        # Format the creation and update timestamps.
        created_at = now.strftime('%Y-%m-%d %H:%M:%S+09')
        updated_at = created_at # Initially, updated_at is the same as created_at

        # Add group information to the 'spaces' table in Supabase
        new_space = {
            'id': space_id,
            'title': title,
            'view_token': view_token,
            'edit_token': edit_token,
            'created_at': created_at,
            'updated_at': updated_at
        }
        data, count = supabase.table('spaces').insert([new_space]).execute()

        # Add members to the 'space_members' table in Supabase
        new_members_data = []
        for member_name in members:
            new_member = {
                'id': str(uuid.uuid4()),
                'space_id': space_id,
                'role': "editor",
                'nickname': member_name,
                'created_at': created_at,
            }
            new_members_data.append(new_member)

        if new_members_data:
            data, count = supabase.table('space_members').insert(new_members_data).execute()

        return {
            "space_id": space_id,
            "view_token": view_token,
            "edit_token": edit_token,
            "message": "Group created successfully."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

# Code to fetch data from Supabase tables for testing
try:
    response = supabase.table('space_members').select('*').execute()
    print("既存のspace_membersテーブルのデータ:")
    print(response.data)
except Exception as e:
    print(f"データの取得中にエラーが発生しました: {e}")

try:
    response = supabase.table('spaces').select('*').execute()
    print("既存のspacesテーブルのデータ:")
    print(response.data)
except Exception as e:
    print(f"データの取得中にエラーが発生しました: {e}")

# Test fetching a specific space
try:
    target_id = "550e8400-e29b-41d4-a716-446655440000"
    res = (supabase.table("spaces")
           .select("*")
           .eq("id", target_id)
           .maybe_single()  # 見つからなければ None
           .execute())
    row = res.data
    print(f"\nFetching space with ID {target_id}:")
except Exception as e:
    print(f"Error fetching space data: {e}")

@app.get("/api/spaces/{space_id}/get/")
async def get_space_details(space_id: str):
    """
    指定されたspace_idのスペースとメンバー情報を取得します
    """
    try:
        # Fetch space information
        space_res = (supabase.table("spaces")
                     .select("*")
                     .eq("id", space_id)
                     .maybe_single()
                     .execute())

        space_data = space_res.data

        # Check if space exists
        if not space_data:
            raise HTTPException(status_code=404, detail=f"Space with id {space_id} not found")

        # Fetch member information
        members_res = (supabase.table("space_members")
                       .select("*")
                       .eq("space_id", space_id)
                       .execute())

        members_data = members_res.data if members_res.data else []

        # Return the data in the defined models
        return {
            "space": space_data,
            "members": members_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
@app.put("/api/spaces/{space_id}/update/")
async def update_space(space_id: str, token: Optional[str] = Query(None), title: Optional[str] = Query(None), members_to_add: Optional[List[str]] = Query(None), members_to_delete: Optional[List[str]] = Query(None)):
    """
　　指定された space_id のスペース情報 (タイトルとメンバー) を更新します。
    新しいメンバーの追加と、既存メンバーの削除を指定できます。
    タイトルと追加・削除するメンバーはオプションです
    """
    try:
        # 認証（編集権限が必須）
        permission_level, verified_space_id = await authenticate_token(
            space_id=space_id,
            token=token,
            required_level="edit"
        )
        # スペース情報を取得して存在を確認
        space_res = (supabase.table("spaces")
                     .select("*")
                     .eq("id", space_id)
                     .maybe_single()
                     .execute())

        space_data = space_res.data

        if not space_data:
            raise HTTPException(status_code=404, detail=f"Space with id {space_id} not found")

        # JSTタイムゾーンを設定
        jst = timezone(timedelta(hours=9))
        now = datetime.now(jst)
        updated_at = now.strftime('%Y-%m-%d %H:%M:%S+09')

        update_data = {"updated_at" : updated_at}
       #タイトルが指定されている場合、更新データに追加
        if title is not None:
            update_data["title"] = title

        #更新データがupdated_at以外にある場合のみupdateを実行
        if len(update_data) > 1:
            update_res = (supabase.table("spaces")
                          .update(update_data)
                          .eq("id", space_id)
                          .execute())

        # 削除するメンバーがいる場合、削除を実行
        if members_to_delete:
            delete_members_res = (supabase.table("space_members")
                                  .delete()
                                  .eq("space_id", space_id)
                                  .in_("nickname", members_to_delete) # Delete members whose nickname is in the list
                                  .execute())

        # 新しいメンバーを追加(members_to_addが指定されている場合のみ)
        if members_to_add:
          new_members_data = []
          for member_name in members_to_add:
            new_member = {
                'id': str(uuid.uuid4()),
                'space_id': space_id,
                'role': "editor",  # デフォルトロール
                'nickname': member_name,
                'created_at': datetime.now(jst).strftime('%Y-%m-%d %H:%M:%S+09'),
            }
            new_members_data.append(new_member)

            if new_members_data:
              insert_members_res = (supabase.table('space_members')
                                  .insert(new_members_data)
                                  .execute())

        # 更新されたスペース情報を取得
        updated_space_res = (supabase.table("spaces")
                             .select("*")
                             .eq("id", space_id)
                             .maybe_single()
                             .execute())

        updated_space_data = updated_space_res.data

        # 更新されたメンバー情報を取得
        updated_members_res = (supabase.table("space_members")
                               .select("*")
                               .eq("space_id", space_id)
                               .execute())

        updated_members_data = updated_members_res.data if updated_members_res.data else []


        return {
            "space": updated_space_data,
            "members": updated_members_data,
            "message": "Space updated successfully."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.get("/api/goals/list/{space_id}/get/")
async def get_goals_list(space_id: str):
    """
  supabaseからspace_idでフィルタリングデータを取得し完了済みと未完了タスクに分離し達成率を計算する。
    """
    try:
        # Supabaseからspace_idでフィルタリングしてデータを取得
        res = (supabase.table("goals")
               .select("id,title,detail,assignee,due_on,status")
               .eq("space_id", space_id)
               .execute())

        if not res.data:
            return {"error": f"No data found for space_id: {space_id}"}

        # 完了済みと未完了のタスクを分離
        done_tasks = [task for task in res.data if task['status'] == 'done']
        todo_tasks = [task for task in res.data if task['status'] == 'todo']

        done_count = len(done_tasks)
        todo_count = len(todo_tasks)
        total_count = done_count + todo_count

        # 達成率を計算
        if total_count > 0:
            achievement_rate = (done_count / total_count) * 100
        else:
            achievement_rate = 0.0

        # 完了済みと未完了のタスクの詳細を準備
        done_details = [{"id": task["id"],"title" : task["title"],'detail': task['detail'], 'assignee': task['assignee'], 'due_on': task['due_on']} for task in done_tasks]
        todo_details = [{"id": task["id"],"title" : task["title"],'detail': task['detail'], 'assignee': task['assignee'], 'due_on': task['due_on']} for task in todo_tasks]

        return {
            "space_id": space_id,
            "total_count": total_count,
            "done_count": done_count,
            "todo_count": todo_count,
            "achievement_rate": round(achievement_rate, 2),
            "done_tasks": done_details,
            "todo_tasks": todo_details
        }

    except Exception as e:
        return {"error": f"An error occurred: {e}"}

@app.post("/api/goals/{space_id}/add/")
async def create_goal(space_id: str, title: str, detail: str, assignee: str, due_on: str):
    """
  新しい目標IDと目標データを作成し、タイムゾーンを設定。このデータをsupabaseに新しい目標として挿入
    """
    try:
        # 新しい目標のIDを生成
        new_goal_id = str(uuid.uuid4())

        # JSTタイムゾーンを設定
        jst = timezone(timedelta(hours=9))
        now = datetime.now(jst)
        created_at = now.strftime('%Y-%m-%d %H:%M:%S+09')
        updated_at = created_at

        # 新しい目標のデータを作成
        new_goal = {
            'id': new_goal_id,
            'space_id': space_id,
            'title': title,
            'detail': detail,
            'assignee': assignee,
            'due_on': due_on,
            'status': 'todo',
            'tags': [],
            'order_index': 0,
            'created_at': created_at,
            'updated_at': updated_at
        }

        # Supabaseに新しい目標を挿入
        res = supabase.table("goals").insert(new_goal).execute()

        return {
            "message": f"Goal created successfully in space {space_id} with ID: {new_goal_id}",
            "space_id": space_id,
            "goal_id": new_goal_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while adding task: {e}")


@app.put("/api/goals/{goal_id}/update/")
async def update_goal(goal_id: str, title: Optional[str] = Query(None), detail: Optional[str] = Query(None), assignee: Optional[str] = Query(None), due_on:Optional [str] = Query(None), status: Optional[str] = Query(None)): # Added status parameter
    """
    指定された goal_id の目標情報を更新します。
    リクエストパラメータから title,detail, assignee, due_on, status を受け取ります。
    これらのパラメータはオプション。
    更新された目標情報と成功メッセージを返します。
    statusがtodoからdoneに更新された場合は特別なメッセージを含めます。
    """
    try:
        # JSTタイムゾーンを設定
        jst = timezone(timedelta(hours=9))
        now = datetime.now(jst)
        updated_at = now.strftime('%Y-%m-%d %H:%M:%S+09')

        # Supabaseの'goals'テーブルを更新するためのデータ辞書を作成
        update_data = {"updated_at": updated_at}

        if title is not None:
            update_data["title"] = title
        if detail is not None:
            update_data["detail"] = detail
        if assignee is not None:
            update_data["assignee"] = assignee
        if due_on is not None:
            update_data["due_on"] = due_on
        if status is not None:
            update_data["status"] = status

       #更新データがupdated_at以外にある場合のみupdateを実行
        if len(update_data) > 1:
          res = (supabase.table("goals")
               .update(update_data)
               .eq("id", goal_id)
               .execute())

        message = f"Goal with ID {goal_id} updated successfully."
        return {
            "goal_id": goal_id,
            "message": message
        }

    except HTTPException as http_exc:
        # HTTPException (404エラーを含む)の場合はそのまま再発生させる
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal server error occured: {e}")

@app.delete("/api/goals/{goal_id}/close/")
async def close_goal(goal_id: str):
    """
    指定された goal_id を持つ目標の status を 'close' に更新します。
    成功した場合は 204 No Content を返します。
    目標が存在しない場合は404 Not Found を返します。
    それ以外のエラーは 500 Internal Server Error を返します。
    """
    try:
        # Supabaseから該当のgoal_idの目標を取得して存在確認
        #current_goal_res が None でないか及び current_goal_res.data が None でないか確認
        goal_res = (supabase.table("goals")
                  .select("id")
                  .eq("id", goal_id)
                  .maybe_single()
                  .execute())
        #goal_res が None でないか、および goal_res.data が None でないか確認
        if not goal_res or not goal_res.data :
            # 目標が存在しない場合 404 Not Found を返す
            raise HTTPException(status_code=404, detail=f"Goal with id {goal_id} not found.")
        
        # JSTタイムゾーンを設定
        jst = timezone(timedelta(hours=9))
        now = datetime.now(jst)
        updated_at = now.strftime('%Y-%m-%d %H:%M:%S+09')

        # supabaseの"goals"テーブルを更新してstatusを"close"に変更
        update_data = {
            "status": "close",
            "updated_at": updated_at
        }
        #更新処理の実行。一致する行がなくてもエラーにはならない
        res = (supabase.table("goals")
               .update(update_data)
               .eq("id", goal_id)
               .execute())
        #ここで res.count をチェックして更新されたか確認することも可能ですが、
        #上記の存在チェックで404を返しているので、更新は成功するとみなせます。

        # 成功の場合は 204 No Content を返す
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException as http_exc:
      # HTTPException (404エラーを含む)の場合はそのまま再発生させる
      raise http_exc

    except Exception as e:
        # その他の予期しないエラーが発生した場合
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {e}")

@app.get("/api/goals/{goal_id}/comments/get/")
async def get_goal_comments(goal_id: str):
    """
    指定された goal_id の目標に紐づくコメント一覧を取得し、時系列順にソートで返す。
    各コメントは"id","author","body","created_at"を含む
    """
    try: 
        #Supabaseの"comments"テーブルから指定されたgoal_idでフィルタリングしてデータを取得
        #created_atで昇順にソート
        res = (supabase.table("comments")
               .select("id,author,body,created_at")
               .eq("goal_id", goal_id)
               .order("created_at", desc=False)
               .execute())
        
        #取得したコメントのリストを返す
        #res.dataがnoneの場合はカラリストを返す
        comments_list = res.data if res.data else []
        return comments_list

    except Exception as e:
      #エラー発生時
        raise HTTPException(status_code=500, detail=f"コメント取得中にエラーが発生しました: {e}")

#Pydanticモデルを定義してリクエストボディの検証を行う
class CommentCreate(BaseModel):
    author: str = Field(..., max_length=50) #authorは必須で最大50文字
    body: str = Field(..., min_length=1, max_length=500) #bodyは必須で1文字から500文字

    @validator("author")
    def author_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("author cannot be empty")
        return v
        
    @validator("body")
    def body_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("body cannot be empty")
        return v

@app.post("/api/goals/{goal_id}/comments/add/")
async def create_goal_comment(goal_id: str, comment: CommentCreate):
  """
  指定されたgoal_idに紐づく目標に新しいコメントを作成する。
  author,bodyはリクエストを受け取り、要件を満たすか検証を行う。
  成功時はコメント作成と成功メッセージを返す。
  """
  try:
    # JSTタイムゾーンを設定
    jst = timezone(timedelta(hours=9))
    now = datetime.now(jst)
    created_at = now.strftime('%Y-%m-%d %H:%M:%S+09')

    #新しいコメントデータを作成
    new_comment_data = {
        "id": str(uuid.uuid4()),
        "goal_id": goal_id,
        "author": comment.author,
        "body": comment.body,
        "created_at": created_at
    }

    #Supabaseの"comments"テーブルに新しいコメントを挿入
    res = supabase.table("comments").insert(new_comment_data).execute()

    #作成されたコメント情報を返す
    #Supabaseのinsertが挿入データを返す設定であれば res.data を使用
    created_comment = res.data[0] if res.data else new_comment_data #挿入データを取得できたか確認

    return {
        "message": "Comment created successfully.",
        "comment": created_comment
    }

  except Exception as e:
    #エラーが発生した場合
    raise HTTPException(status_code=500, detail = f"コメントの作成中にエラーが発生しました:{e}")

#Pydanticモデルを定義してリクエストボディの検証を行う
class ReactionCreate(BaseModel):
    author: str = Field(..., max_length=50) #authorは必須で最大50文字
    emoji: str = Field(..., max_length=20) #emojiは必須で最大20文字

    @validator("author")
    def author_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("author cannot be empty")
        return v

    @validator("emoji")
    def emoji_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("emoji cannot be empty")
        return v

@app.post("/api/goals/{goal_id}/reactions/add/")
async def create_goal_reaction(goal_id: str, reaction: ReactionCreate):
  """
  指定されたgoal_idに紐づくリアクションを作成。
  author,emojiをリクエストボディで受け取り検証。
  成功した場合は作成されたリアクション情報と成功メッセージを返す。
  """
  try:
    #JSTタイムゾーンを設定
    jst = timezone(timedelta(hours=9))
    now = datetime.now(jst)
    created_at = now.strftime('%Y-%m-%d %H:%M:%S+09')

    #新しいリアクションデータを作成
    new_reaction_data = {
        "id": str(uuid.uuid4()),
        "goal_id": goal_id,
        "author": reaction.author,
        "emoji": reaction.emoji,
        "created_at": created_at
    }
    #Supabaseの"reactions"テーブルに新しいリアクションを挿入
    res = supabase.table("reactions").insert([new_reaction_data]).execute()

    #作成されたリアクション情報を返す
    #Supabaseのinsertが挿入データを返す設定であれば res.data を使用
    created_reaction = res.data[0] if res.data else new_reaction_data #挿入データを取得できたか確認

    return {
        "message": "Reaction created successfully.",
        "reaction": created_reaction
    }

  except Exception as e:
    #エラーが発生した場合
    raise HTTPException(status_code=500, detail = f"リアクションの作成中にエラーが発生しました:{e}")

@app.get("/api/goals/{goal_id}/reactions/get/")
async def get_goal_reactions(goal_id: str):
  """
  指定されたgoal_idに紐づくリアクション一覧を取得し時系列順でソートで返す。
  各リアクションは"id","author","emoji","created_at"を含む
  """
  try:
    #Supabaseの"reactions"テーブルから指定されたgoal_idでフィルタリングしてデータを取得
        #created_atで昇順にソート
        res = (supabase.table("reactions")
               .select("id,author,emoji,created_at")
               .eq("goal_id", goal_id)
               .order("created_at", desc=False)
               .execute())
        
        #取得したコメントのリストを返す
        #res.dataがnoneの場合はカラリストを返す
        comments_list = res.data if res.data else []
        return comments_list

  except Exception as e:
      #エラー発生時
        raise HTTPException(status_code=500, detail=f"コメント取得中にエラーが発生しました: {e}")
