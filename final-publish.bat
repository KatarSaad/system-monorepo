@echo off
echo Starting Verdaccio registry...
start /B verdaccio --config verdaccio-config.yaml

echo Waiting for registry to start...
timeout /t 5 /nobreak > nul

echo Publishing packages...
cd packages\core && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\monitoring && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\shared && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\infrastructure && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\security && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\validation && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\logging && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\audit && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\events && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\rate-limiting && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\search && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\health && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\backup && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\config && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\feature-flags && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\file-storage && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\queue && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\notifications && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\testing && npm publish --registry=http://localhost:4873 && cd ..\..
cd packages\system-module && npm publish --registry=http://localhost:4873 && cd ..\..

echo Done! Check http://localhost:4873
pause