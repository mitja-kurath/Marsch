# Marsch

A modernised Swiss hiking time planner based on the SAC Leistungskilometer formula.

Upload a KML (Swisstopo) or GPX (Komoot, Strava, AllTrails) file and Marsch calculates walking times, ascent, descent, and generates a printable Marschzeittabelle.

## Stack

- SvelteKit 2 + Svelte 5 (runes mode)
- TypeScript
- Tailwind CSS v4
- Vitest
- Swisstopo elevation API (no key required)

## Usage

```bash
bun install
bun run dev
```

## Credits

Heavily inspired by [marschzeittabelle](https://github.com/ckolin/marschzeittabelle) by [@ckolin](https://github.com/ckolin). This project is essentially a modernised rebuild of that original idea — same formula, same purpose, new stack. Thank you for the great work.

## License

MIT — see [LICENSE](LICENSE)
