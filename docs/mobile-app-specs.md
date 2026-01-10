# Knarr Mobile App Specifications

## Overview

This document outlines the technical specifications for building a React Native mobile companion app for Knarr that shares data with the existing web application through Supabase.

---

## Architecture: Shared Data via Supabase

```
┌─────────────────┐     ┌─────────────────┐
│   Knarr Web     │     │  Knarr Mobile   │
│   (Next.js)     │     │ (React Native)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    Supabase Auth      │
         │    (shared session)   │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  Supabase   │
              │  Database   │
              │  (entities) │
              └─────────────┘
```

Both applications connect to the same Supabase project, using:
- **Same authentication** - Users log in once, session persists across devices
- **Same database** - Generic `entities` table with JSONB storage
- **Same user_id** - Consistent user identification across platforms
- **Real-time sync** - Supabase Realtime for live updates between devices

---

## Shared Code Strategy

### Recommended: Monorepo with Shared Packages

```
irora-platform/
├── packages/
│   ├── knarr-core/           # Shared business logic
│   │   ├── hooks/
│   │   │   ├── useKnarrData.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useEncryption.ts
│   │   ├── lib/
│   │   │   ├── entities.ts
│   │   │   ├── encryption.ts
│   │   │   ├── dateUtils.ts
│   │   │   └── calculationUtils.ts
│   │   ├── types/
│   │   │   └── index.ts       # All TypeScript types
│   │   └── constants/
│   │       ├── dopamineProtocol.ts
│   │       └── categories.ts
│   └── knarr-ui/             # Optional: shared UI logic
│       └── components/       # Platform-agnostic components
├── apps/
│   ├── knarr-web/            # Next.js (current knarr)
│   └── knarr-mobile/         # React Native app
└── package.json              # Workspace root
```

### Package Manager

Use **pnpm workspaces** or **yarn workspaces** for efficient dependency management:

```json
// package.json (root)
{
  "name": "irora-platform",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### Shared Package Structure

```typescript
// packages/knarr-core/package.json
{
  "name": "@irora/knarr-core",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./hooks": "./dist/hooks/index.js",
    "./lib": "./dist/lib/index.js",
    "./types": "./dist/types/index.js",
    "./constants": "./dist/constants/index.js"
  }
}
```

---

## React Native Tech Stack

### Core Dependencies

| Category | Library | Notes |
|----------|---------|-------|
| Framework | React Native + Expo | Managed workflow for easier development |
| Navigation | React Navigation | Native stack navigation |
| State | Zustand or React Query | Lightweight, works with existing hooks |
| Storage | AsyncStorage | localStorage equivalent for RN |
| Auth | @supabase/supabase-js | Same client, works in React Native |
| HTTP | Built-in fetch | Native fetch API |

### UI & Styling

| Category | Library | Notes |
|----------|---------|-------|
| Styling | NativeWind | Tailwind-like styling for RN |
| Components | React Native Paper | Material Design components |
| Animations | Reanimated 2 | Native animations (60fps) |
| Gestures | React Native Gesture Handler | Touch handling |

### Charts & Visualization

| Category | Library | Notes |
|----------|---------|-------|
| Charts | Victory Native | Same API as Victory (web) |
| Alternative | react-native-chart-kit | Simpler, lighter weight |

### Mobile-Specific

| Category | Library | Notes |
|----------|---------|-------|
| Push Notifications | Expo Notifications | Bearing reminders, message delivery |
| Biometrics | expo-local-authentication | FaceID/TouchID for finance |
| Haptics | expo-haptics | Feedback on completions |
| Secure Storage | expo-secure-store | Encrypted local storage |

---

## Data Sync Approach

### 1. Same Entities Pattern

Both web and mobile use the same generic `entities` table:

```typescript
// Shared entity structure
interface Entity {
  id: string
  user_id: string
  entity_type: string  // 'habit', 'task', 'weight', etc.
  data: Record<string, any>  // JSONB payload
  created_at: string
  updated_at: string
}
```

### 2. Real-time Sync

Enable Supabase Realtime for live updates:

```typescript
// In useKnarrData hook (shared)
const subscription = supabase
  .channel('entities')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'entities' },
    (payload) => {
      // Update local state
      handleEntityChange(payload)
    }
  )
  .subscribe()
```

### 3. Offline Support

Mobile needs robust offline handling:

```typescript
// Offline queue structure
interface QueuedAction {
  id: string
  action: 'create' | 'update' | 'delete'
  entity_type: string
  data: any
  timestamp: number
  synced: boolean
}

// Store in AsyncStorage when offline
// Process queue when connection restored
```

### 4. Conflict Resolution

Simple "last write wins" strategy:

```typescript
// Compare timestamps on sync
if (localEntity.updated_at > serverEntity.updated_at) {
  // Push local changes to server
} else {
  // Accept server changes
}
```

---

## Platform Differences

### Storage

| Web | Mobile |
|-----|--------|
| `localStorage` | `AsyncStorage` |
| Synchronous API | Async API |
| ~5MB limit | ~6MB recommended |

```typescript
// Shared storage interface
interface StorageAdapter {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

// Web implementation
const webStorage: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
}

// Mobile implementation
const mobileStorage: StorageAdapter = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
}
```

### Navigation

| Web | Mobile |
|-----|--------|
| URL-based routing | Stack navigation |
| Browser history | Navigation state |
| Deep links via URLs | Deep links via scheme |

### Styling

| Web | Mobile |
|-----|--------|
| Tailwind CSS | NativeWind / StyleSheet |
| CSS properties | RN style properties |
| `className` | `style` prop |

Example with NativeWind (recommended for consistency):

```tsx
// Web (Tailwind)
<div className="bg-forge-black p-4 rounded-xl">

// Mobile (NativeWind)
<View className="bg-forge-black p-4 rounded-xl">
```

### Charts

| Web | Mobile |
|-----|--------|
| Recharts | Victory Native |
| SVG rendering | Native SVG |
| Mouse events | Touch events |

---

## Mobile-Specific Features

### 1. Push Notifications

```typescript
// Notification types
type NotificationType =
  | 'bearing_reminder'    // Weekly/monthly bearing due
  | 'message_delivery'    // Message in a bottle delivered
  | 'habit_reminder'      // Custom habit reminders
  | 'streak_warning'      // About to lose streak
  | 'goal_milestone'      // Progress milestone

// Schedule bearing reminders
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Weekly Bearing Due',
    body: 'Take a moment to reflect on your week',
  },
  trigger: {
    weekday: 7, // Sunday
    hour: 18,
    minute: 0,
    repeats: true,
  },
})
```

### 2. Home Screen Widgets

iOS Widget / Android Widget showing:
- Today's heading
- Habit completion progress
- Current streak
- Quick log buttons

### 3. Haptic Feedback

```typescript
// On task/habit completion
await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
)

// On goal milestone
await Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Heavy
)
```

### 4. Biometric Authentication

For Finance tab (sensitive data):

```typescript
const authenticate = async () => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to view finances',
    fallbackLabel: 'Use PIN',
  })
  return result.success
}
```

### 5. Quick Actions (3D Touch / Long Press)

```typescript
// App icon quick actions
const quickActions = [
  { id: 'log-calories', title: 'Log Calories', icon: 'flame' },
  { id: 'log-weight', title: 'Log Weight', icon: 'scale' },
  { id: 'complete-habit', title: 'Complete Habit', icon: 'check' },
]
```

---

## Screen Structure

```
knarr-mobile/
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── Dashboard/
│   │   ├── DashboardScreen.tsx      # Main hub
│   │   └── components/
│   │       ├── QuickStats.tsx
│   │       ├── TodaysFocus.tsx
│   │       └── RecentActivity.tsx
│   ├── Health/
│   │   ├── HealthScreen.tsx
│   │   ├── CaloriesScreen.tsx
│   │   └── WeightScreen.tsx
│   ├── Tasks/
│   │   ├── TasksScreen.tsx
│   │   └── HabitsScreen.tsx
│   ├── Reflect/
│   │   ├── ReflectScreen.tsx
│   │   ├── BearingScreen.tsx
│   │   └── MessagesScreen.tsx
│   ├── Goals/
│   │   ├── GoalsScreen.tsx
│   │   └── WaypointsScreen.tsx
│   ├── Wealth/
│   │   ├── WealthScreen.tsx
│   │   └── AccountsScreen.tsx
│   └── Settings/
│       └── SettingsScreen.tsx
└── navigation/
    ├── RootNavigator.tsx
    ├── TabNavigator.tsx
    └── types.ts
```

### Navigation Structure

```tsx
// Bottom tab navigation (primary)
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Health" component={HealthScreen} />
    <Tab.Screen name="Tasks" component={TasksScreen} />
    <Tab.Screen name="Reflect" component={ReflectScreen} />
    <Tab.Screen name="Goals" component={GoalsScreen} />
  </Tab.Navigator>
)

// Stack navigation (within each tab)
const HealthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HealthOverview" component={HealthScreen} />
    <Stack.Screen name="Calories" component={CaloriesScreen} />
    <Stack.Screen name="Weight" component={WeightScreen} />
  </Stack.Navigator>
)
```

---

## Migration Path

### Phase 1: Setup (1-2 days)
1. Create monorepo structure
2. Move shared code to `@irora/knarr-core`
3. Update web app to use shared package
4. Verify web app still works

### Phase 2: Mobile Foundation (3-5 days)
1. Initialize Expo project
2. Set up navigation structure
3. Configure Supabase client
4. Implement auth flow
5. Basic data fetching with `useKnarrData`

### Phase 3: Core Features (1-2 weeks)
1. Dashboard screen
2. Health tracking (calories, weight)
3. Tasks & habits
4. Reflect tab (bearings, messages)
5. Goals & waypoints

### Phase 4: Mobile Enhancements (1 week)
1. Push notifications
2. Offline support
3. Haptic feedback
4. Biometric auth for finance

### Phase 5: Polish (1 week)
1. Widgets
2. Quick actions
3. Performance optimization
4. Testing across devices

---

## Environment Configuration

```typescript
// Shared config for both platforms
const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  // Feature flags
  features: {
    finance: true,
    protocol: true,
    realtime: true,
  },
}
```

### Expo Environment Variables

```bash
# .env (mobile)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## Testing Strategy

### Unit Tests
- Shared hooks and utilities
- State management logic
- Date/calculation functions

### Integration Tests
- Supabase data operations
- Auth flows
- Offline sync queue

### E2E Tests
- Detox for React Native
- Critical user flows
- Cross-device sync verification

---

## Performance Considerations

### 1. Minimize Bundle Size
- Use dynamic imports
- Tree-shake unused code
- Optimize images

### 2. Efficient Data Loading
- Paginate large lists
- Cache frequently accessed data
- Use optimistic updates

### 3. Memory Management
- Clean up subscriptions
- Limit stored offline data
- Use FlatList for long lists

### 4. Battery Optimization
- Batch network requests
- Reduce background activity
- Efficient real-time subscriptions

---

## Security Considerations

### 1. Secure Storage
- Use expo-secure-store for sensitive data
- Never store encryption keys in AsyncStorage
- Clear sensitive data on logout

### 2. Certificate Pinning
- Pin Supabase certificates
- Prevent MITM attacks

### 3. Biometric Auth
- Require for finance tab
- Optional for app unlock
- Fallback to PIN

### 4. Data Encryption
- Finance data encrypted at rest
- Same encryption as web app
- Key derived from user PIN

---

## Future Considerations

### Apple Watch / Wear OS
- Quick habit completion
- Calorie logging
- Streak display
- Step count integration

### Siri / Google Assistant
- "Log 1500 calories"
- "Complete my morning habit"
- "What's my current streak?"

### HealthKit / Google Fit
- Auto-import weight
- Step count data
- Sleep tracking
