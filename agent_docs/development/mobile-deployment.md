# Mobile Deployment (Capacitor)

## Native Folder Structure

```
ios/                 # iOS project (committed to git)
├── App/
│   ├── App/
│   │   ├── public/      # Synced from dist/ (IGNORED in git)
│   │   └── capacitor.config.json
│   └── Podfile

android/             # Android project (committed to git)
├── app/
│   └── src/
│       └── main/
│           └── assets/  # Synced from dist/ (IGNORED in git)
```

**Key Points**:
- Native projects (`ios/`, `android/`) are committed to git (contain customisable config)
- Generated web assets are gitignored
- Always build (`npm run build`) before syncing (`npx cap sync`)

## Development Workflow

```bash
# 1. Build web app
npm run build

# 2. Sync to native platforms
npx cap sync

# 3. Open in IDE
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

**Important**: Always run `npm run build` before `npx cap sync` to ensure native platforms have the latest web assets.

## Debugging Mobile Issues

1. **Web debugging**: Test in browser first (`npm run dev`)
2. **iOS Safari debugging**: Open Safari → Develop → [Device] → localhost
3. **Android Chrome debugging**: chrome://inspect on desktop Chrome
4. **Console logs**: Use `console.log()` - visible in platform dev tools

## Platform-Specific Testing

### iOS
- Use iOS Simulator for quick testing
- Test on real device for touch interactions, performance
- Check Safari-specific issues (webkit rendering differences)

### Android
- Use Android Emulator for quick testing
- Test on real device for varying screen sizes
- Check Chrome-specific issues

## App Store Deployment

Not yet implemented. See:
- iOS: [Capacitor iOS Deployment Guide](https://capacitorjs.com/docs/ios)
- Android: [Capacitor Android Deployment Guide](https://capacitorjs.com/docs/android)

## Common Issues

### Assets Not Updating
- Ensure `npm run build` completed successfully
- Run `npx cap sync` after building
- Sometimes need to clean native builds in Xcode/Android Studio

### Platform-Specific Bugs
- Check Capacitor plugin compatibility
- Verify `capacitor.config.json` settings
- Test with platform dev tools for detailed logs
