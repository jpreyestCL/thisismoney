# Flujo de trabajo

- El usuario autoriza que, después de cada modificación completada en este proyecto, se ejecuten las verificaciones pertinentes, se cree un commit y se haga push a `main` en `origin`, para poder ver los cambios en el servidor.
- Aplicar este flujo sin volver a pedir confirmación. Si se trabaja en un worktree con HEAD separado, publicar con `git push origin HEAD:main`.
- Antes de publicar, comprobar el estado de `origin/main` e integrar sus cambios si corresponde. No usar force push ni sobrescribir cambios ajenos.
- Si la verificación, el commit o el push fallan, informar el impedimento; no afirmar que el servidor está actualizado sin haberlo verificado.
