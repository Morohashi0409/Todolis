from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field

# Supabase設定
SUPABASE_URL = "https://jroelrbrmifcsrwyzgka.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyb2VscmJybWlmY3Nyd3l6Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDk0MTgsImV4cCI6MjA3MTE4NTQxOH0.2D1pRTrutbhYy04sbVHzY7nHEnaIIQdGrEV832esP9o"

# Supabaseクライアントの初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/goals/list/{space_id}")
async def get_goals_list(space_id: str):
    try:
        # Supabaseからspace_idでフィルタリングしてデータを取得
        res = (supabase.table("goals")
               .select("id,detail,assignee,due_on,status")
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
        done_details = [{'detail': task['detail'], 'assignee': task['assignee'], 'due_on': task['due_on']} for task in done_tasks]
        todo_details = [{'detail': task['detail'], 'assignee': task['assignee'], 'due_on': task['due_on']} for task in todo_tasks]

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

@app.put("/api/goals/{goal_id}")
async def update_goal(goal_id: str,  title: Optional[str] = Query(None), 
                     detail: Optional[str] = Query(None), assignee: Optional[str] = Query(None), 
                     status: Optional[str] = Query(None), due_on: Optional[str] = Query(None), 
                     tags: Optional[List[str]] = Query(None)):
    """
    Updates goal information for a given goal_id.
    Requires edit_token for authentication.
    """
    try:
        # 目標の存在確認
        goal_res = (supabase.table("goals")
                   .select("*")
                   .eq("id", goal_id)
                   .maybe_single()
                   .execute())
        
        if not goal_res.data:
            raise HTTPException(status_code=404, detail=f"Goal with ID {goal_id} not found")

        # 更新データの準備
        update_data = {}
        if title is not None:
            if len(title) < 1 or len(title) > 200:
                raise HTTPException(status_code=400, detail="Title must be between 1 and 200 characters")
            update_data['title'] = title
        
        if detail is not None:
            if len(detail) > 1000:
                raise HTTPException(status_code=400, detail="Detail must be less than 1000 characters")
            update_data['detail'] = detail
        
        if assignee is not None:
            if len(assignee) > 50:
                raise HTTPException(status_code=400, detail="Assignee must be less than 50 characters")
            update_data['assignee'] = assignee
        
        if status is not None:
            if status not in ['todo', 'doing', 'done']:
                raise HTTPException(status_code=400, detail="Status must be one of: todo, doing, done")
            update_data['status'] = status
        
        if due_on is not None:
            # 日付形式の検証（YYYY-MM-DD）
            try:
                datetime.strptime(due_on, '%Y-%m-%d')
                update_data['due_on'] = due_on
            except ValueError:
                raise HTTPException(status_code=400, detail="Due date must be in YYYY-MM-DD format")
        
        if tags is not None:
            if len(tags) > 10:
                raise HTTPException(status_code=400, detail="Maximum 10 tags allowed")
            for tag in tags:
                if len(tag) > 20:
                    raise HTTPException(status_code=400, detail="Each tag must be less than 20 characters")
            update_data['tags'] = tags
        
        # 更新日時を設定
        jst = timezone(timedelta(hours=9))
        update_data['updated_at'] = datetime.now(jst).strftime('%Y-%m-%d %H:%M:%S+09')
        
        # 更新データがある場合のみ更新を実行
        if update_data:
            update_res = (supabase.table("goals")
                         .update(update_data)
                         .eq("id", goal_id)
                         .execute())
            
            # 更新された目標情報を取得
            updated_goal_res = (supabase.table("goals")
                              .select("*")
                              .eq("id", goal_id)
                              .maybe_single()
                              .execute())
            
            return {
                "goal": updated_goal_res.data,
                "message": "Goal updated successfully."
            }
        else:
            return {
                "goal": goal_res.data,
                "message": "No changes made to the goal."
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.post("/api/spaces/{space_id}/goals")
async def create_goal(space_id: str, title: str, detail: str, assignee: str, due_on: str):
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

@app.post("/api/spaces")
async def create_group(title: str, members: List[str]): # Modified to accept title and members as individual parameters
    """
    Creates a new goal sharing group with random view and edit tokens using Supabase.
    Adds group information to the 'spaces' table and members to the 'space_members' table.
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

@app.get("/api/spaces/{space_id}")
async def get_space_details(space_id: str):
    """
    Fetches space and member information for a given space_id.
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
            "space": SpaceInfo(**space_data),
            "members": [SpaceMember(**member) for member in members_data]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

@app.put("/api/spaces/{space_id}")
async def update_space(space_id: str, title: str = Query(...), members: List[str] = Query(...), members_to_delete: Optional[List[str]] = Query(None)):
    """
    Updates space information (title and members) for a given space_id.
    Allows adding new members and specifying existing members to delete.
    """
    try:
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

        # スペースのタイトルを更新
        update_space_res = (supabase.table("spaces")
                            .update({"title": title, "updated_at": updated_at})
                            .eq("id", space_id)
                            .execute())

        # 削除するメンバーがいる場合、削除を実行
        if members_to_delete:
            delete_members_res = (supabase.table("space_members")
                                  .delete()
                                  .eq("space_id", space_id)
                                  .in_("nickname", members_to_delete) # Delete members whose nickname is in the list
                                  .execute())

        # 新しいメンバーを追加
        new_members_data = []
        # 既存のメンバーを取得して、追加するメンバーリストに含まれていないか確認
        existing_members_res = (supabase.table("space_members")
                                .select("nickname")
                                .eq("space_id", space_id)
                                .execute())
        existing_members_nicknames = [member['nickname'] for member in existing_members_res.data] if existing_members_res.data else []

        for member_name in members:
            if member_name not in existing_members_nicknames: # Add only if the member does not exist
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

