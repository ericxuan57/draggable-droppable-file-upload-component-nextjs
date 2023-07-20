"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import classNames from "classnames";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const FileUpload = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileList, setFileList] = useState<File[] | null>(null);
  const [shouldHighlight, setShouldHighlight] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const uploading = progress > 0 && progress < 100;

  const preventDefaultHandler = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: any) => {
    if (!e.target.files || e.target.files?.length === 0) return;

    setFileList(Array.from(e.target.files));

    e.target.value = null;
  };

  const handleUpload = async () => {
    const UPLOAD_URL = "/api/upload";
    const data = new FormData();
    
    for (let file of fileList!) {
      data.append(file.name, file);
    }
    
    try {
      await axios.post(UPLOAD_URL, data, {
        onUploadProgress(e) {
          const progress = e.progress ?? 0;
          setProgress(progress * 100);
          if (progress * 100 >= 100) {
            setFileList(null);
          }
        },
      });
    } catch (error) {
      setProgress(0);
      console.log('error: ', error);
    }
  };

  return (
    <div
      className={classNames({
        "w-full h-96": true,
        "p-4 grid place-content-center cursor-pointer": true,
        "text-violet-500 rounded-lg": true,
        "border-4 border-dashed ": true,
        "transition-colors": true,
        "border-violet-500 bg-violet-100": shouldHighlight,
        "border-violet-100 bg-violet-50": !shouldHighlight,
      })}
      onDragOver={(e) => {
        preventDefaultHandler(e);
        setShouldHighlight(true);
      }}
      onDragEnter={(e) => {
        preventDefaultHandler(e);
        setShouldHighlight(true);
      }}
      onDragLeave={(e) => {
        preventDefaultHandler(e);
        setShouldHighlight(false);
      }}
      onDrop={(e) => {
        preventDefaultHandler(e);
        const files = Array.from(e.dataTransfer.files);
        setFileList(files);
        setShouldHighlight(false);
      }}
    >
      <div className="flex flex-col items-center">
        {!fileList ? (
          <>
            <input ref={inputRef} type="file" multiple={true} className="hidden" onChange={handleChange} />
            <CloudArrowUpIcon className="w-10 h-10" />
            <div>
              <button className="underline" onClick={onButtonClick}>Upload files</button> 
              <span> or drag it here</span>
            </div>
          </>
        ) : (
          <>
            <p>Files to Upload</p>
            {fileList.map((file, i) => {
              return <span key={i}>{file.name}</span>;
            })}
            <div className="flex gap-2 mt-2">
              <button
                className={classNames({
                  "bg-violet-500 text-violet-50 px-2 py-1 rounded-md": true,
                  "pointer-events-none opacity-40 w-full": uploading,
                })}
                onClick={() => {
                  handleUpload();
                }}
              >
              {uploading
                ? `Uploading...  ( ${progress.toFixed(2)}% )`
                : "Upload"}
              </button>
              {!uploading && (
                <button
                  className="px-2 py-1 border rounded-md border-violet-500"
                  onClick={() => {
                    setFileList(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
