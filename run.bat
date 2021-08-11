@echo off
setlocal

goto begin
:begin
    echo ---------------------------------
    echo -- Creating bulk contact notes --
    echo ---------------------------------
    node index.js
    pause 