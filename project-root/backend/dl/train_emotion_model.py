"""
Training script for Emotion Detection using Convolutional Neural Networks.

Dataset structure expected:
train/
   angry/
   disgust/
   fear/
   happy/
   neutral/
   sad/
   surprise/
test/
   ...
"""

import os 
import tensorflow as tf 
from tensorflow .keras .models import Sequential 
from tensorflow .keras .layers import Conv2D ,MaxPooling2D ,Flatten ,Dense ,Dropout ,Flatten ,BatchNormalization 
from tensorflow .keras .preprocessing .image import ImageDataGenerator 
from tensorflow .keras .optimizers import Adam 
from tensorflow .keras .callbacks import ModelCheckpoint ,EarlyStopping ,ReduceLROnPlateau 

def build_model (input_shape =(48 ,48 ,1 ),num_classes =7 ):
    """Build a Simple CNN for emotion detection."""
    model =Sequential ([

    Conv2D (64 ,(3 ,3 ),padding ='same',activation ='relu',input_shape =input_shape ),
    BatchNormalization (),
    Conv2D (64 ,(3 ,3 ),padding ='same',activation ='relu'),
    BatchNormalization (),
    MaxPooling2D (pool_size =(2 ,2 )),
    Dropout (0.25 ),


    Conv2D (128 ,(5 ,5 ),padding ='same',activation ='relu'),
    BatchNormalization (),
    Conv2D (128 ,(5 ,5 ),padding ='same',activation ='relu'),
    BatchNormalization (),
    MaxPooling2D (pool_size =(2 ,2 )),
    Dropout (0.25 ),


    Conv2D (256 ,(3 ,3 ),padding ='same',activation ='relu'),
    BatchNormalization (),
    Conv2D (256 ,(3 ,3 ),padding ='same',activation ='relu'),
    BatchNormalization (),
    MaxPooling2D (pool_size =(2 ,2 )),
    Dropout (0.25 ),


    Flatten (),
    Dense (256 ,activation ='relu'),
    BatchNormalization (),
    Dropout (0.5 ),
    Dense (num_classes ,activation ='softmax')
    ])

    model .compile (optimizer =Adam (learning_rate =0.001 ),
    loss ='categorical_crossentropy',
    metrics =['accuracy'])
    return model 

def main ():

    train_dir =r"C:\Users\Pankaj\Downloads\archive\train"
    test_dir =r"C:\Users\Pankaj\Downloads\archive\test"


    if not os .path .exists (train_dir )or not os .path .exists (test_dir ):
        print ("Dataset directories not found. Please verify the paths.")
        return 


    batch_size =64 
    epochs =10 
    img_size =48 


    train_datagen =ImageDataGenerator (
    rescale =1. /255 ,
    rotation_range =15 ,
    width_shift_range =0.1 ,
    height_shift_range =0.1 ,
    horizontal_flip =True ,
    fill_mode ='nearest'
    )


    test_datagen =ImageDataGenerator (rescale =1. /255 )

    print (f"Loading training data from {train_dir }")
    train_generator =train_datagen .flow_from_directory (
    train_dir ,
    target_size =(img_size ,img_size ),
    color_mode ="grayscale",
    batch_size =batch_size ,
    class_mode ="categorical",
    shuffle =True 
    )

    print (f"Loading validation data from {test_dir }")
    validation_generator =test_datagen .flow_from_directory (
    test_dir ,
    target_size =(img_size ,img_size ),
    color_mode ="grayscale",
    batch_size =batch_size ,
    class_mode ="categorical",
    shuffle =False 
    )


    model =build_model (input_shape =(img_size ,img_size ,1 ),num_classes =7 )
    model .summary ()


    script_dir =os .path .dirname (os .path .abspath (__file__ ))
    model_path =os .path .join (script_dir ,"emotion_model.keras")

    checkpoint =ModelCheckpoint (model_path ,monitor ='val_accuracy',verbose =1 ,save_best_only =True ,mode ='max')
    early_stopping =EarlyStopping (monitor ='val_loss',patience =5 ,verbose =1 ,restore_best_weights =True )
    reduce_lr =ReduceLROnPlateau (monitor ='val_loss',factor =0.2 ,patience =3 ,verbose =1 ,min_lr =1e-6 )


    print ("\nStarting Training...")
    history =model .fit (
    train_generator ,
    steps_per_epoch =train_generator .samples //train_generator .batch_size ,
    epochs =epochs ,
    validation_data =validation_generator ,
    validation_steps =validation_generator .samples //validation_generator .batch_size ,
    callbacks =[checkpoint ,early_stopping ,reduce_lr ]
    )

    print (f"\nTraining Complete. Best model saved to {model_path }")


    score =model .evaluate (validation_generator )
    print (f"Validation Loss: {score [0 ]:.4f}")
    print (f"Validation Accuracy: {score [1 ]:.4f}")

if __name__ =="__main__":
    main ()
