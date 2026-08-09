import { Redirect, type Href } from "expo-router";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function Index() {
  const { state } = usePrototype();
  if (!state.authed) return <Redirect href={"/login" as Href} />;
  if (state.onboarding !== "DONE") return <Redirect href={"/onboarding" as Href} />;
  return <Redirect href={"/(tabs)/now" as Href} />;
}
