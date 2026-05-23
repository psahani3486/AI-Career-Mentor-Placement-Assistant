"""
RAG Knowledge Assistant API Router.
Endpoints to upload documents (PDFs) and query the knowledge base.
"""

import os 
from typing import List ,Dict ,Optional 
from fastapi import APIRouter ,Depends ,HTTPException ,UploadFile ,File ,status 
from pydantic import BaseModel 
from sqlalchemy .orm import Session 

from config import settings 
from database .session import get_db 
from database .models import User 
from api .auth import get_current_user 
from rag .pipeline import RAGPipeline 

router =APIRouter (prefix ="/api/rag",tags =["RAG Knowledge Base"])


RAG_UPLOAD_DIR =os .path .join (os .path .dirname (os .path .dirname (__file__ )),"rag_uploads")
os .makedirs (RAG_UPLOAD_DIR ,exist_ok =True )


rag_pipeline =RAGPipeline ()



class QueryRequest (BaseModel ):
    question :str 
    k :Optional [int ]=5 

class QueryResponse (BaseModel ):
    answer :str 
    sources :List [Dict ]

class DocumentResponse (BaseModel ):
    doc_id :str 
    doc_name :str 
    chunks :int 



@router .post ("/ingest",response_model =DocumentResponse ,status_code =status .HTTP_201_CREATED )
async def ingest_document (
file :UploadFile =File (...),
current_user :User =Depends (get_current_user ),
):
    """Ingest a PDF document into the RAG vector database."""
    if not file .filename .lower ().endswith (".pdf"):
        raise HTTPException (status_code =400 ,detail ="Only PDF files are accepted")


    file_path =os .path .join (RAG_UPLOAD_DIR ,file .filename )
    try :
        content =await file .read ()
        with open (file_path ,"wb")as f :
            f .write (content )


        result =rag_pipeline .ingest_pdf (file_path ,doc_name =file .filename )

        if result .get ("status")=="error":
            raise HTTPException (status_code =500 ,detail =result .get ("message"))

        return DocumentResponse (
        doc_id =result ["doc_id"],
        doc_name =result ["doc_name"],
        chunks =result ["chunks_count"]
        )
    except Exception as e :
        raise HTTPException (status_code =500 ,detail =f"Failed to ingest document: {str (e )}")
    finally :

        if os .path .exists (file_path ):
            os .remove (file_path )

@router .post ("/query",response_model =QueryResponse )
async def query_knowledge_base (
req :QueryRequest ,
current_user :User =Depends (get_current_user ),
):
    """Query the ingested PDF knowledge base for answers."""
    try :
        res =rag_pipeline .query (req .question ,k =req .k )
        return QueryResponse (
        answer =res ["answer"],
        sources =res ["sources"]
        )
    except Exception as e :
        raise HTTPException (status_code =500 ,detail =f"Query failed: {str (e )}")

@router .get ("/documents",response_model =List [DocumentResponse ])
async def list_documents (
current_user :User =Depends (get_current_user ),
):
    """List all ingested documents in the RAG pipeline."""
    try :
        docs =rag_pipeline .list_documents ()
        return [
        DocumentResponse (
        doc_id =d ["doc_id"],
        doc_name =d ["doc_name"],
        chunks =d ["chunks"]
        )
        for d in docs 
        ]
    except Exception as e :
        raise HTTPException (status_code =500 ,detail =f"Failed to list documents: {str (e )}")
