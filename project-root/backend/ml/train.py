"""
Training and evaluation pipeline for Resume Scoring ML Model.

Trains a Random Forest model on resume data using extracted features
and provides comprehensive evaluation metrics.
"""

import os 
import sys 
import pandas as pd 
import numpy as np 
import pickle 
import json 
from typing import Dict ,Tuple 
from datetime import datetime 

from sklearn .model_selection import train_test_split ,cross_val_score 
from sklearn .ensemble import RandomForestRegressor ,GradientBoostingRegressor 
from sklearn .preprocessing import StandardScaler 
from sklearn .metrics import mean_squared_error ,mean_absolute_error ,r2_score 

from resume_scorer import ResumeScorer 


class ResumeModelTrainer :
    """ML training and evaluation pipeline for resume scoring."""

    def __init__ (self ):
        self .scorer =ResumeScorer ()
        self .model =None 
        self .scaler =StandardScaler ()
        self .feature_names =[]
        self .training_history ={}

    def load_data (self ,csv_path :str )->pd .DataFrame :
        """Load resume dataset from CSV."""
        print (f"Loading data from {csv_path }...")
        df =pd .read_csv (csv_path )
        print (f"✓ Loaded {len (df )} resume records")
        print (f"Columns: {list (df .columns )[:5 ]}...")
        return df 

    def extract_features_batch (self ,texts :list )->pd .DataFrame :
        """Extract features from multiple resume texts."""
        print (f"\nExtracting features from {len (texts )} resumes...")
        features_list =[]

        for idx ,text in enumerate (texts ):
            if pd .isna (text )or text =="":

                features ={
                "word_count":0 ,
                "sections_count":0 ,
                "skills_count":0 ,
                "action_verbs_count":0 ,
                "metrics_count":0 ,
                "contact_info_score":0 ,
                "bullet_points":0 ,
                }
            else :
                features_raw =self .scorer .extract_features (str (text ))
                features ={
                "word_count":features_raw ["word_count"],
                "sections_count":features_raw ["sections_count"],
                "skills_count":features_raw ["skills_count"],
                "action_verbs_count":features_raw ["action_verbs_count"],
                "metrics_count":features_raw ["metrics_count"],
                "contact_info_score":(
                features_raw ["has_email"]*1 
                +features_raw ["has_phone"]*1 
                +features_raw ["has_linkedin"]*0.5 
                +features_raw ["has_github"]*0.5 
                ),
                "bullet_points":features_raw ["bullet_points"],
                }

            features_list .append (features )

            if (idx +1 )%max (1 ,len (texts )//10 )==0 :
                print (f"  Processed {idx +1 }/{len (texts )} resumes")

        return pd .DataFrame (features_list )

    def prepare_data (
    self ,df :pd .DataFrame ,text_column :str ="career_objective",score_column :str ="matched_score"
    )->Tuple [np .ndarray ,np .ndarray ]:
        """Prepare features and target variable."""
        print (f"\nPreparing data with text column: '{text_column }' and target: '{score_column }'")


        df [text_column ]=df [text_column ].fillna ("")


        X =self .extract_features_batch (df [text_column ].tolist ())
        self .feature_names =X .columns .tolist ()


        y =pd .to_numeric (df [score_column ],errors ="coerce").fillna (0.5 ).values 


        if y .max ()<=1.0 :
            y =y *100 

        print (f"✓ Features shape: {X .shape }")
        print (f"✓ Target shape: {y .shape }")
        print (f"✓ Target score range: {y .min ():.2f} - {y .max ():.2f}")
        print (f"✓ Target score mean: {y .mean ():.2f} ± {y .std ():.2f}")

        return X .values ,y 

    def train_model (self ,X :np .ndarray ,y :np .ndarray )->Dict :
        """Train Random Forest model with cross-validation."""
        print ("\n"+"="*60 )
        print ("TRAINING MODELS")
        print ("="*60 )


        X_train ,X_test ,y_train ,y_test =train_test_split (
        X ,y ,test_size =0.2 ,random_state =42 
        )

        print (f"Training set size: {len (X_train )}")
        print (f"Test set size: {len (X_test )}")


        X_train_scaled =self .scaler .fit_transform (X_train )
        X_test_scaled =self .scaler .transform (X_test )


        print ("\nTraining Random Forest Regressor...")
        rf_model =RandomForestRegressor (
        n_estimators =100 ,
        max_depth =15 ,
        min_samples_split =5 ,
        min_samples_leaf =2 ,
        random_state =42 ,
        n_jobs =-1 ,
        )
        rf_model .fit (X_train_scaled ,y_train )
        print ("✓ Random Forest trained")


        cv_scores =cross_val_score (rf_model ,X_train_scaled ,y_train ,cv =5 ,scoring ="r2")
        print (f"✓ 5-Fold CV R² Score: {cv_scores .mean ():.4f} (+/- {cv_scores .std ():.4f})")


        y_pred_train =rf_model .predict (X_train_scaled )
        y_pred_test =rf_model .predict (X_test_scaled )


        train_metrics =self ._compute_metrics (y_train ,y_pred_train ,"Train")
        test_metrics =self ._compute_metrics (y_test ,y_pred_test ,"Test")


        feature_importance =sorted (
        zip (self .feature_names ,rf_model .feature_importances_ ),
        key =lambda x :x [1 ],
        reverse =True ,
        )

        print ("\n"+"-"*60 )
        print ("FEATURE IMPORTANCE")
        print ("-"*60 )
        for feat ,importance in feature_importance :
            print (f"  {feat :.<30} {importance :.4f} {'█'*int (importance *100 )}")

        self .model =rf_model 
        return {
        "train_metrics":train_metrics ,
        "test_metrics":test_metrics ,
        "cv_scores":cv_scores .tolist (),
        "feature_importance":dict (feature_importance ),
        "model_type":"RandomForestRegressor",
        }

    def _compute_metrics (self ,y_true :np .ndarray ,y_pred :np .ndarray ,phase :str )->Dict :
        """Compute evaluation metrics."""
        mse =mean_squared_error (y_true ,y_pred )
        mae =mean_absolute_error (y_true ,y_pred )
        rmse =np .sqrt (mse )
        r2 =r2_score (y_true ,y_pred )

        print (f"\n{phase } Metrics:")
        print (f"  R² Score:        {r2 :.4f}")
        print (f"  MAE:             {mae :.4f}")
        print (f"  RMSE:            {rmse :.4f}")
        print (f"  MSE:             {mse :.4f}")

        return {"r2":r2 ,"mae":mae ,"rmse":rmse ,"mse":mse }

    def save_model (self ,model_path :str ="resume_model.pkl")->str :
        """Save trained model and scaler."""
        print (f"\n✓ Saving model to {model_path }...")
        with open (model_path ,"wb")as f :
            pickle .dump ({"model":self .model ,"scaler":self .scaler ,"features":self .feature_names },f )
        print (f"✓ Model saved successfully")
        return model_path 

    def save_metrics (self ,metrics :Dict ,metrics_path :str ="training_metrics.json")->str :
        """Save training metrics."""
        print (f"✓ Saving metrics to {metrics_path }...")
        metrics ["timestamp"]=datetime .now ().isoformat ()
        with open (metrics_path ,"w")as f :
            json .dump (metrics ,f ,indent =2 )
        print (f"✓ Metrics saved successfully")
        return metrics_path 


def main ():
    """Main training pipeline."""

    script_dir =os .path .dirname (os .path .abspath (__file__ ))
    data_path =os .path .join (script_dir ,"resume_data.csv")
    model_path =os .path .join (script_dir ,"resume_model.pkl")
    metrics_path =os .path .join (script_dir ,"training_metrics.json")

    print ("\n"+"="*60 )
    print ("RESUME SCORING MODEL - TRAINING PIPELINE")
    print ("="*60 )


    trainer =ResumeModelTrainer ()


    df =trainer .load_data (data_path )


    X ,y =trainer .prepare_data (df )


    metrics =trainer .train_model (X ,y )


    trainer .save_model (model_path )
    trainer .save_metrics (metrics ,metrics_path )

    print ("\n"+"="*60 )
    print ("TRAINING COMPLETE!")
    print ("="*60 )
    print (f"\n📊 Summary:")
    print (f"  Model Performance (Test): R² = {metrics ['test_metrics']['r2']:.4f}")
    print (f"  Mean Absolute Error: {metrics ['test_metrics']['mae']:.4f}")
    print (f"  Root Mean Squared Error: {metrics ['test_metrics']['rmse']:.4f}")
    print (f"\n💾 Artifacts saved:")
    print (f"  • Model: {model_path }")
    print (f"  • Metrics: {metrics_path }")


if __name__ =="__main__":
    main ()
