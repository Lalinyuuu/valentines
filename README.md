# 💖 Valentine Project

A beautiful Valentine's Day themed web application built with Next.js, React, and TypeScript.

## 📁 Project Structure

```
Vd2/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   ├── styles/          # Additional styles
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
│   ├── images/         # Images
│   └── fonts/          # Fonts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Features

- ⚡️ Next.js 14 with App Router
- 💎 TypeScript for type safety
- 🎨 Tailwind CSS 4 (Alpha) for modern styling
- 🎮 Three.js for 3D graphics
- 📦 GLB/GLTF 3D model support
- 🎭 React Three Fiber & Drei for React integration
- 💖 Valentine's Day themed design
- ✨ Interactive 3D scenes with animations

## 📝 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 3D Models

### Available Components:

1. **SimpleScene** - Procedural 3D heart (no model needed)
2. **Scene3D** - For custom GLB/GLTF models
3. **Model3D** - GLB model loader
4. **Heart3D** - Procedural heart shape

### Adding your own 3D models:

1. Download or create a `.glb` model
2. Place it in `public/models/`
3. Use it in your components:

```tsx
<Scene3D modelPath="/models/your-model.glb" />
```

### Free 3D model resources:

- 🎨 [Sketchfab](https://sketchfab.com/features/gltf)
- 🍕 [Poly Pizza](https://poly.pizza)
- 💎 [Clara.io](https://clara.io)

## 🎯 Next Steps

1. Add your Valentine components in `src/components/`
2. Create new pages in `src/app/`
3. Add 3D models to `public/models/`
4. Add images to `public/images/`
5. Define types in `src/types/`
6. Check out `/demo` page for 3D model examples

Happy coding! 💕✨
