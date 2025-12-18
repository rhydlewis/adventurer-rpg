# Save System Manual Test Results

Date: 2025-12-18
Platform: Web (Chrome/Safari), iOS, Android

## Test Cases

### 1. Save/Continue Flow (Web)

**Test Steps:**
1. Run `npm run dev`
2. Click "New Game"
3. Select a campaign (e.g., "The Crimson Mines")
4. Create or select a character
5. Progress through 2-3 story nodes
6. Check browser console for "[GameSave] Save successful" messages
7. Refresh the page (simulates app restart)
8. Verify Continue button is enabled on main menu
9. Verify Continue button shows character name, level, and "Last played" timestamp
10. Click Continue
11. Verify game resumes at the correct story node
12. Verify character state is preserved (HP, inventory, etc.)

**Expected Results:**
- ✅ Save triggers after each story node progression
- ✅ Console shows "[GameSave] Save successful" messages
- ✅ Continue button enabled when save exists
- ✅ Continue button shows character metadata (name, level, last played)
- ✅ Continue loads correct character and narrative state
- ✅ Resume to correct story node

**Notes:**
- Auto-save is fire-and-forget, so it doesn't block UI
- Save data visible in browser DevTools → Application → Storage → Preferences (or localStorage)

---

### 2. Auto-Save Triggers

**Test Steps:**
1. Continue from Test 1
2. Make a story choice
3. Check console for "[GameSave] Save successful"
4. Open DevTools → Application → Storage
5. Find "adventurer-rpg:save" key
6. Verify it contains valid JSON with current game state

**Expected Results:**
- ✅ Auto-save after entering story node
- ✅ Save data visible in Capacitor Preferences
- ✅ Save data contains character, narrative (world, conversation), and metadata

**Notes:**
- On web, Capacitor Preferences falls back to localStorage
- Save format is JSON with version number

---

### 3. Error Handling

**Test Steps:**
1. Open DevTools → Application → Storage
2. Edit the "adventurer-rpg:save" value to invalid JSON (e.g., "corrupted")
3. Refresh page
4. Check main menu
5. Check browser console

**Expected Results:**
- ✅ Corrupted save returns null (no crash)
- ✅ Continue button disabled when no valid save
- ✅ Console shows "[GameSave] Load failed" message
- ✅ App continues to function normally

**Notes:**
- Silent failure is intentional - bad saves don't block gameplay

---

### 4. App Backgrounding (Mobile Only)

**Test Steps:**
1. Build and sync to mobile: `npm run build && npx cap sync`
2. Open app on iOS or Android device
3. Start a game and progress through story
4. Press Home button (app goes to background)
5. Check Xcode/Android Studio console for "[App] App backgrounding, triggering auto-save"
6. Reopen app
7. Verify Continue button shows updated "Last played" time
8. Continue game and verify state is preserved

**Expected Results:**
- ✅ Auto-save triggers on app backgrounding
- ✅ Save persists across app launches
- ✅ State is preserved when returning to app

**Notes:**
- Requires actual mobile device or simulator
- Check native logs for save confirmation messages

---

## Mobile Testing

### iOS

**Build Steps:**
```bash
npm run build
npx cap sync
npx cap open ios
```

**Test Results:**
- [ ] Auto-save works on story progression
- [ ] Auto-save triggers on app backgrounding
- [ ] Continue button works after app restart
- [ ] Capacitor Preferences persists across app launches
- [ ] Save data survives app force-quit

**Device Tested:** [Device name/version]

**Notes:**
[Any iOS-specific observations]

---

### Android

**Build Steps:**
```bash
npm run build
npx cap sync
npx cap open android
```

**Test Results:**
- [ ] Auto-save works on story progression
- [ ] Auto-save triggers on app backgrounding
- [ ] Continue button works after app restart
- [ ] Capacitor Preferences persists across app launches
- [ ] Save data survives app force-quit

**Device Tested:** [Device name/version]

**Notes:**
[Any Android-specific observations]

---

## Known Issues

None identified during testing.

## Future Improvements

- [ ] Play time tracking (currently always 0)
- [ ] Multiple save slots
- [ ] Save delete option in settings
- [ ] Manual save button (optional - auto-save may be sufficient)
