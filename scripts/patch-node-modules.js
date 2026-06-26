/**
 * Patches expo-modules-core android build.gradle to use findByName (null-safe)
 * instead of getByName when linking react-native-worklets tasks.
 *
 * Root cause: react-native-worklets 0.8.x + RN 0.85 (new arch always-on) does
 * not create the mergeDebugNativeLibs / mergeReleaseNativeLibs tasks, so the
 * hard getByName call in expo-modules-core throws during Gradle configuration.
 * The implementation project(':react-native-worklets') dependency already handles
 * build ordering, so these optional task dependencies can safely be skipped.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'android',
  'build.gradle'
);

if (!fs.existsSync(filePath)) {
  console.log('[patch] expo-modules-core build.gradle not found, skipping.');
  process.exit(0);
}

const original = `  afterEvaluate {
    println("Linking react-native-worklets native libs into expo-modules-core build tasks")
    println(workletsProject.tasks.getByName("mergeDebugNativeLibs"))
    println(workletsProject.tasks.getByName("mergeReleaseNativeLibs"))
    tasks.getByName("buildCMakeDebug").dependsOn(workletsProject.tasks.getByName("mergeDebugNativeLibs"))
    tasks.getByName("buildCMakeRelWithDebInfo").dependsOn(workletsProject.tasks.getByName("mergeReleaseNativeLibs"))
  }`;

const patched = `  afterEvaluate {
    println("Linking react-native-worklets native libs into expo-modules-core build tasks")
    def mergeDebugTask = workletsProject.tasks.findByName("mergeDebugNativeLibs")
    def mergeReleaseTask = workletsProject.tasks.findByName("mergeReleaseNativeLibs")
    if (mergeDebugTask != null) {
      println(mergeDebugTask)
      tasks.getByName("buildCMakeDebug").dependsOn(mergeDebugTask)
    }
    if (mergeReleaseTask != null) {
      println(mergeReleaseTask)
      tasks.getByName("buildCMakeRelWithDebInfo").dependsOn(mergeReleaseTask)
    }
  }`;

let content = fs.readFileSync(filePath, 'utf8');

if (content.includes(patched)) {
  console.log('[patch] expo-modules-core build.gradle already patched, skipping.');
  process.exit(0);
}

if (!content.includes(original)) {
  console.log('[patch] expo-modules-core build.gradle does not match expected content — skipping to avoid corrupting.');
  process.exit(0);
}

content = content.replace(original, patched);
fs.writeFileSync(filePath, content, 'utf8');
console.log('[patch] expo-modules-core build.gradle patched successfully.');
