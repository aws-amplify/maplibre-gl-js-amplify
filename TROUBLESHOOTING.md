# TROUBLESHOOTING

## Cypress test error: "Error: Snapshot images do not match." but they look the same

- If the expected and actual screenshots look the same except for color differences this could be caused by a Color Profile setting in OSX
- Go to `Settings > Displays > Color` and from there you can choose a different color profile and re-run cypress tests
  - Try color profile `sRGB IEC61966-2.1`
