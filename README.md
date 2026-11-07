# Degoog Uptime

Uptime history for the public degoog instances listed in [instances.json](https://github.com/degoog-org/degoog/blob/main/instances.json), live at https://degoog-org.github.io/uptime/.

## Just to nerd out

I really am a cheap bastard and I don't want to pay for any hosting. Tried to keep this clever, every 30 minutes a GitHub Actions job calls `/readyz` and `/api/whodis` on each instance and saves the result to SQLite. It then pushes `uptime.sqlite.zst` and `status.json` to the `data` branch in this very repo, which is where the page reads it from. Thought it was a clever design, if you have better ideas open an issue, very much open to suggestions, especially from people who have done this kind of work before.

To add your instance, use "Add your instance" on the page or open a pull request on [degoog](https://github.com/degoog-org/degoog).
There's a handy button on the page to make it as easy as possible, but ultimately you'll have at the very least edit/fork or point your AI of choice at my codebase and do your prayers it'll understand the chaos lol
