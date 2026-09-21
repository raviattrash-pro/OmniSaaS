@echo off
title OmniSaaS - Google Search Indexer
color 0b
echo ====================================================================
echo        OMNISAAS GOOGLE SEARCH INDEXING ^& SEO ENGINE
echo ====================================================================
echo.
echo Running automated Google Search indexing and sitemap generation...
echo.

node scripts/google_indexing.js

echo.
echo ====================================================================
echo Indexing routine completed.
echo Press any key to exit.
echo ====================================================================
pause >nul
