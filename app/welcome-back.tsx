import { useEffect } from "react";
import { useRouter } from "expo-router";

/** Legacy route: returning users now land on Home with a light banner instead of this screen. */
export default function WelcomeBackRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/(tabs)/dashboard?welcomeBack=1");
  }, [router]);
  return null;
}
