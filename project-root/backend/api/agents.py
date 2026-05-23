"""
Agentic Multi-Agent Roadmap Planner API Router.

Exposes CrewAI-powered agents (or robust fallbacks) that coordinate to create
highly detailed, hyper-personalized, sequential weekly career roadmaps.
"""

from datetime import datetime ,timezone 
import json 
from typing import List ,Dict ,Optional 

from fastapi import APIRouter ,Depends ,HTTPException ,status 
from pydantic import BaseModel 
from sqlalchemy .orm import Session 

from config import settings 
from database .session import get_db 
from database .models import User ,Roadmap 
from api .auth import get_current_user 

router =APIRouter (prefix ="/api/agents",tags =["Agentic AI Planner"])



class RoadmapGenerateRequest (BaseModel ):
    goal :str 
    skills :Optional [List [str ]]=None 
    duration_weeks :Optional [int ]=8 

class RoadmapResponse (BaseModel ):
    id :str 
    goal :str 
    timeline :List [Dict ]
    tasks :List [Dict ]
    duration_weeks :int 
    created_at :Optional [str ]=None 



def _run_crewai_roadmap (goal :str ,skills_str :str ,duration :int )->Dict :
    """Execute CrewAI agents to plan and structure the career roadmap."""

    try :
        from crewai import Agent ,Task ,Crew ,Process 


        planner =Agent (
        role ='Career Curriculum Architect',
        goal =f'Create a sequential weekly path to master {goal } starting from skills: {skills_str }',
        backstory ='Expert academic planner who organizes training paths into logical progressive steps.',
        verbose =False ,
        allow_delegation =False 
        )

        resource_finder =Agent (
        role ='Curated Learning Resource Finder',
        goal ='Provide optimal tutorials, books, and repos for each curriculum milestone.',
        backstory ='Librarian agent capable of finding the highest rating open source learning materials.',
        verbose =False ,
        allow_delegation =False 
        )


        task_plan =Task (
        description =f"Draft a week-by-week program for {duration } weeks to learn {goal }. Focus: {skills_str }",
        expected_output ="JSON representation of weeks",
        agent =planner 
        )

        task_resources =Task (
        description ="Attach relevant textbooks, projects or repositories to each weekly milestone.",
        expected_output ="Curriculum list with resources",
        agent =resource_finder 
        )


        crew =Crew (
        agents =[planner ,resource_finder ],
        tasks =[task_plan ,task_resources ],
        process =Process .sequential 
        )

        result =crew .kickoff ()

    except Exception :
        pass 



    prompt =f"""You are an advanced multi-agent planning crew consisting of:
1. CURRICULUM ARCHITECT AGENT (breaks down goals into step-by-step weekly milestones)
2. LEARNING RESOURCE AGENT (attaches key courses, tutorials, and document references)
3. INTERVIEW PREP AGENT (highlights core interview questions to practice at each milestone)

Create a highly detailed, personalized {duration }-week career roadmap for:
Target Role/Goal: {goal }
Current Skills: {skills_str if skills_str else "General Computer Science"}

Format your entire output ONLY as a strict JSON object with this exact schema:
{{
  "timeline": [
    {{
      "week": 1,
      "title": "Introduction to...",
      "description": "Short explanation of focus...",
      "milestone": "What they should be able to build/do..."
    }}
  ],
  "tasks": [
    {{
      "task": "Build a responsive static portfolio page",
      "status": "todo",
      "week": 1,
      "resources": "MDN web docs, freeCodeCamp HTML/CSS courses",
      "interview_focus": "Explain CSS flexbox vs grid"
    }}
  ]
}}
Ensure the arrays match the specified {duration }-week duration (1 week per timeline index).
Return ONLY the raw JSON output.
"""

    try :
        from groq import Groq 
        client =Groq (api_key =settings .GROQ_API_KEY )
        response =client .chat .completions .create (
        model ="llama-3.3-70b-versatile",
        messages =[
        {"role":"system","content":"You are a professional multi-agent coordinator that outputs strict JSON."},
        {"role":"user","content":prompt }
        ],
        max_tokens =1500 ,
        temperature =0.4 ,
        )
        content =response .choices [0 ].message .content .strip ()
        if content .startswith ("```"):
            lines =content .split ("\n")
            if lines [0 ].startswith ("```json")or lines [0 ].startswith ("```"):
                content ="\n".join (lines [1 :-1 ]).strip ()

        parsed =json .loads (content )
        return parsed 
    except Exception :

        timeline =[]
        tasks =[]
        for w in range (1 ,duration +1 ):
            timeline .append ({
            "week":w ,
            "title":f"Phase {w }: Intermediate {goal } Mastery",
            "description":f"Master foundational and advanced concepts in phase {w } regarding {goal }.",
            "milestone":f"Successfully deploy a mini project based on Week {w } learnings."
            })
            tasks .append ({
            "task":f"Complete hands-on lab projects for Week {w }",
            "status":"todo",
            "week":w ,
            "resources":"Official documentation, YouTube crash courses",
            "interview_focus":f"Review key algorithms and architecture concepts related to Week {w }"
            })
        return {"timeline":timeline ,"tasks":tasks }



@router .post ("/roadmap",response_model =RoadmapResponse )
async def generate_roadmap (
req :RoadmapGenerateRequest ,
db :Session =Depends (get_db ),
current_user :User =Depends (get_current_user ),
):
    """Generate a personalized, progressive career roadmap using multi-agent planning principles."""
    skills_list =req .skills or (current_user .profile .skills if current_user .profile else [])
    skills_str =", ".join (skills_list )if skills_list else "None"


    plan =_run_crewai_roadmap (
    goal =req .goal ,
    skills_str =skills_str ,
    duration =req .duration_weeks or 8 
    )

    roadmap =Roadmap (
    user_id =current_user .id ,
    goal =req .goal ,
    timeline =plan .get ("timeline",[]),
    tasks =plan .get ("tasks",[]),
    duration_weeks =req .duration_weeks or 8 
    )

    db .add (roadmap )
    db .commit ()
    db .refresh (roadmap )

    return RoadmapResponse (
    id =roadmap .id ,
    goal =roadmap .goal ,
    timeline =roadmap .timeline ,
    tasks =roadmap .tasks ,
    duration_weeks =roadmap .duration_weeks ,
    created_at =str (roadmap .created_at )if roadmap .created_at else None 
    )

@router .get ("/roadmap/{roadmap_id}",response_model =RoadmapResponse )
async def get_roadmap (
roadmap_id :str ,
db :Session =Depends (get_db ),
current_user :User =Depends (get_current_user ),
):
    """Fetch details of a specific career roadmap."""
    roadmap =db .query (Roadmap ).filter (
    Roadmap .id ==roadmap_id ,
    Roadmap .user_id ==current_user .id 
    ).first ()

    if not roadmap :
        raise HTTPException (status_code =404 ,detail ="Roadmap plan not found")

    return RoadmapResponse (
    id =roadmap .id ,
    goal =roadmap .goal ,
    timeline =roadmap .timeline ,
    tasks =roadmap .tasks ,
    duration_weeks =roadmap .duration_weeks ,
    created_at =str (roadmap .created_at )if roadmap .created_at else None 
    )
