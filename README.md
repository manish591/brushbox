# Brushbox

Brushbox is a whitboard tool built using React.

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `web`: another [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `ui`: a stub React component library with [Tailwind CSS](https://tailwindcss.com/) shared by both `web` and `docs` applications
- `@brushbox/config-eslint`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@brushbox/config-typescript`: `tsconfig.json`s used throughout the monorepo
- `@brushbox/config-tailwind`: tailwind configuration used throughout the monorepo
- `@brushbox/brushbox`: whitboard package build using react and typescript

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Running locally

> [!NOTE]  
> This project uses [pnpm](https://pnpm.io/) only as a package manager.

1. Clone the repository:

```bash
git clone https://github.com/manish591/brushbox.git
```

2. Navigate to the project directory:

```bash
cd cms
```

3. Install dependencies:

```bash
pnpm install
```

4. Start the development server:

```bash
pnpm run dev
```

5. Access the application in your browser:

```bash
http://localhost:3000
```
