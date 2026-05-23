"""
ML-based resume scoring pipeline.

Uses rule-based heuristics and keyword matching to score resumes
on a 0-100 scale and provide actionable feedback.
"""

import re 
from typing import Dict ,List 



SKILL_KEYWORDS ={
"python","java","javascript","typescript","c++","c#","go","rust","ruby",
"react","angular","vue","next.js","node.js","express","django","flask","fastapi",
"html","css","tailwind","bootstrap","sass",
"sql","postgresql","mysql","mongodb","redis","firebase",
"aws","azure","gcp","docker","kubernetes","terraform","ci/cd",
"git","github","gitlab","jira","agile","scrum",
"machine learning","deep learning","tensorflow","pytorch","scikit-learn","keras",
"nlp","computer vision","data science","pandas","numpy","matplotlib",
"rest api","graphql","microservices","system design",
"linux","bash","powershell",
"figma","photoshop","ui/ux",
}

SECTION_PATTERNS ={
"education":r"(?i)(education|academic|university|college|degree|bachelor|master|phd)",
"experience":r"(?i)(experience|work history|employment|internship|worked at)",
"skills":r"(?i)(skills|technical skills|technologies|proficiency|competencies)",
"projects":r"(?i)(projects|portfolio|personal projects|academic projects)",
"certifications":r"(?i)(certifications?|courses?|training|licenses?)",
"achievements":r"(?i)(achievements?|awards?|honors?|accomplishments?)",
"summary":r"(?i)(summary|objective|about me|profile|overview)",
"contact":r"(?i)(contact|email|phone|address|linkedin|github)",
}

ACTION_VERBS ={
"developed","built","designed","implemented","created","managed",
"led","optimized","improved","deployed","automated","analyzed",
"architected","engineered","delivered","launched","integrated",
"reduced","increased","achieved","collaborated","mentored",
}


class ResumeScorer :
    """Rule-based resume scoring and feedback engine."""

    def extract_features (self ,text :str )->Dict :
        """Extract quantitative features from resume text."""
        text_lower =text .lower ()
        words =text_lower .split ()


        sections_found ={}
        for name ,pattern in SECTION_PATTERNS .items ():
            sections_found [name ]=bool (re .search (pattern ,text ))


        skills =[s for s in SKILL_KEYWORDS if s in text_lower ]


        verbs_used =[v for v in ACTION_VERBS if v in text_lower ]


        metrics =re .findall (r"\d+[%+]|\$[\d,]+|\d+\s*(users?|customers?|projects?|teams?|years?)",text_lower )

        return {
        "word_count":len (words ),
        "sections_found":sections_found ,
        "sections_count":sum (sections_found .values ()),
        "skills_count":len (skills ),
        "skills":skills ,
        "action_verbs_count":len (verbs_used ),
        "metrics_count":len (metrics ),
        "has_email":bool (re .search (r"[\w.-]+@[\w.-]+\.\w+",text )),
        "has_phone":bool (re .search (r"[\+]?[\d\s\-\(\)]{10,}",text )),
        "has_linkedin":"linkedin"in text_lower ,
        "has_github":"github"in text_lower ,
        "bullet_points":text .count ("•")+text .count ("‣")+text .count ("◦"),
        }

    def score (self ,text :str )->float :
        """Score a resume from 0 to 100 based on extracted features."""
        features =self .extract_features (text )
        score =0.0 


        wc =features ["word_count"]
        if 400 <=wc <=800 :
            score +=15 
        elif 200 <=wc <400 or 800 <wc <=1200 :
            score +=10 
        elif wc >100 :
            score +=5 


        score +=min (features ["sections_count"]*2.5 ,20 )


        score +=min (features ["skills_count"]*2 ,20 )


        score +=min (features ["action_verbs_count"]*2 ,10 )


        score +=min (features ["metrics_count"]*2.5 ,10 )


        if features ["has_email"]:
            score +=3 
        if features ["has_phone"]:
            score +=3 
        if features ["has_linkedin"]:
            score +=2 
        if features ["has_github"]:
            score +=2 


        score +=min (features ["bullet_points"]*0.5 ,5 )


        critical =["experience","education","skills"]
        for s in critical :
            if features ["sections_found"].get (s ,False ):
                score +=3.33 

        return round (min (score ,100 ),1 )

    def extract_skills (self ,text :str )->List [str ]:
        """Return a list of detected skills."""
        text_lower =text .lower ()
        return sorted ([s for s in SKILL_KEYWORDS if s in text_lower ])

    def generate_feedback (self ,text :str ,score :float )->Dict :
        """Generate structured feedback with strengths, improvements, and tips."""
        features =self .extract_features (text )
        strengths =[]
        improvements =[]
        missing_sections =[]


        if features ["skills_count"]>=5 :
            strengths .append ("Strong technical skills section with diverse technologies")
        if features ["action_verbs_count"]>=3 :
            strengths .append ("Good use of action verbs to describe accomplishments")
        if features ["metrics_count"]>=2 :
            strengths .append ("Includes quantifiable metrics and achievements")
        if features ["sections_found"].get ("projects"):
            strengths .append ("Projects section showcases hands-on experience")
        if features ["has_linkedin"]and features ["has_github"]:
            strengths .append ("Professional links (LinkedIn, GitHub) are included")


        if features ["skills_count"]<3 :
            improvements .append ("Add more relevant technical skills to your resume")
        if features ["action_verbs_count"]<2 :
            improvements .append ("Use strong action verbs (e.g., 'Developed', 'Optimized', 'Led')")
        if features ["metrics_count"]<1 :
            improvements .append ("Include quantifiable achievements (e.g., 'Reduced load time by 40%')")
        if features ["word_count"]<200 :
            improvements .append ("Resume is too short — expand on your experience and projects")
        elif features ["word_count"]>1200 :
            improvements .append ("Resume is too long — aim for 1-2 pages maximum")
        if features ["bullet_points"]<3 :
            improvements .append ("Use bullet points to improve readability")
        if not features ["has_linkedin"]:
            improvements .append ("Add your LinkedIn profile URL")
        if not features ["has_github"]:
            improvements .append ("Add your GitHub profile to showcase code")


        for section ,found in features ["sections_found"].items ():
            if not found and section in ["education","experience","skills","projects"]:
                missing_sections .append (section .title ())

        return {
        "strengths":strengths if strengths else ["Resume has been uploaded successfully"],
        "improvements":improvements if improvements else ["Your resume looks comprehensive!"],
        "missing_sections":missing_sections ,
        "overall":"Excellent"if score >=80 else "Good"if score >=60 else "Needs Improvement"if score >=40 else "Weak",
        }
