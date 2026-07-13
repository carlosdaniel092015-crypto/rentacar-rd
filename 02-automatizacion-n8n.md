name: Dependabot auto-merge

on: pull_request_target

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    # Solo para PRs abiertos por Dependabot.
    if: ${{ github.actor == 'dependabot[bot]' }}
    runs-on: ubuntu-latest
    steps:
      - name: Obtener metadata de Dependabot
        id: meta
        uses: dependabot/fetch-metadata@v3
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"

      # Auto-aprueba y habilita auto-merge SOLO para parches (semver-patch).
      # Los "minor" y "major" quedan para revisión manual: un minor de un paquete
      # comprometido (cadena de suministro) podría pasar CI y entrar solo, así que
      # se limita el automatismo a la superficie más pequeña posible (patches).
      - name: Habilitar auto-merge (solo patch)
        if: ${{ steps.meta.outputs.update-type == 'version-update:semver-patch' }}
        run: |
          gh pr review --approve "$PR_URL"
          gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
