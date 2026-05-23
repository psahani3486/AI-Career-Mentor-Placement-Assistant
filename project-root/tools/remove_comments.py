
"""Remove Python comments (single-line and inline) while preserving docstrings.

Creates a `.bak` backup for each file before overwriting.
Run from project root: `python tools/remove_comments.py`.
"""
import io 
import os 
import tokenize 

EXCLUDE_DIRS ={".venv","__pycache__","chroma_data","frontend/.next"}


def should_exclude (path ):
    for ex in EXCLUDE_DIRS :
        if ex in path .split (os .sep ):
            return True 
    return False 


def remove_comments_from_source (src :str )->str :
    """Strip COMMENT tokens using the tokenize module."""
    out_tokens =[]
    try :
        tokens =tokenize .generate_tokens (io .StringIO (src ).readline )
        for toknum ,tokval ,_ ,_ ,_ in tokens :
            if toknum ==tokenize .COMMENT :

                continue 
            out_tokens .append ((toknum ,tokval ))
    except Exception :
        return src 
    return tokenize .untokenize (out_tokens )


def process_file (path :str ):
    with open (path ,"r",encoding ="utf-8")as f :
        src =f .read ()

    new_src =remove_comments_from_source (src )
    if new_src !=src :
        bak =path +".bak"
        try :
            if not os .path .exists (bak ):
                open (bak ,"w",encoding ="utf-8").write (src )
        except Exception :
            pass 
        with open (path ,"w",encoding ="utf-8")as f :
            f .write (new_src )


def main ():
    root =os .path .dirname (os .path .dirname (__file__ ))
    for dirpath ,dirnames ,filenames in os .walk (root ):

        if should_exclude (dirpath ):
            continue 
        for name in filenames :
            if not name .endswith (".py"):
                continue 
            path =os .path .join (dirpath ,name )
            process_file (path )


if __name__ =="__main__":
    main ()
