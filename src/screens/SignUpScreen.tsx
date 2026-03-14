import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { PlayfairDisplay_600SemiBold_Italic } from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { AntDesign } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

// ─── Palette ─────────────────────────────────────────────────────────────────
const TERRACOTTA = "#E2725B";
const TERRACOTTA_DARK = "#d1624c";
const STONE_100 = "#f5f5f4";
const STONE_200 = "#e7e5e4";
const STONE_300 = "#d6d3d1";
const STONE_400 = "#a8a29e";
const STONE_500 = "#78716c";
const STONE_600 = "#57534e";
const STONE_700 = "#44403c";
const STONE_800 = "#292524";

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type FocusedField = "fullName" | "email" | "password" | "confirmPassword" | null;

export function SignUpScreen() {
  const router = useRouter();

  // ── All hooks declared before any early return ──
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);

  const [fontsLoaded] = useFonts({
    "PlayfairDisplay_600SemiBold_Italic": PlayfairDisplay_600SemiBold_Italic,
    "Inter_400Regular": Inter_400Regular,
    "Inter_500Medium": Inter_500Medium,
    "Inter_600SemiBold": Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: STONE_100 }} />;
  }

  function validate(): boolean {
    const next: Errors = {};

    if (!fullName.trim()) {
      next.fullName = "Name is required";
    }

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      next.email = "Enter a valid email";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (password && confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert("Sign Up Failed", error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email.trim(),
        full_name: fullName.trim(),
      });

      if (profileError) {
        setLoading(false);
        Alert.alert("Profile Error", profileError.message);
        return;
      }
    }

    setLoading(false);
    router.replace("/(app)/home");
  }

  return (
    // 1. KeyboardAvoidingView shifts content up while keyboard is open
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/*
        2. TouchableWithoutFeedback: tapping any blank area outside
           an input calls Keyboard.dismiss, which closes the keyboard
           and snaps the page back to its original position.
      */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.glassScroll}
          contentContainerStyle={styles.scrollContent}
          // 3. Dragging the scroll view downward also dismisses keyboard + resets layout
          keyboardDismissMode="on-drag"
          // 4. Tapping buttons while keyboard is open still fires onPress correctly
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            {/* ── Header ── */}
            <View style={styles.header}>
              <Text style={styles.logo}>Flourish</Text>
              <Text style={styles.logoSubtitle}>Create your AI-powered kitchen</Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.form}>
              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused === "fullName" && styles.inputFocused,
                    !!errors.fullName && styles.inputError,
                  ]}
                  placeholder="Julianna Smith"
                  placeholderTextColor={STONE_400}
                  value={fullName}
                  onChangeText={(t) => {
                    setFullName(t);
                    if (errors.fullName) setErrors((e) => ({ ...e, fullName: undefined }));
                  }}
                  onFocus={() => setFocused("fullName")}
                  onBlur={() => setFocused(null)}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                />
                {!!errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused === "email" && styles.inputFocused,
                    !!errors.email && styles.inputError,
                  ]}
                  placeholder="hello@example.com"
                  placeholderTextColor={STONE_400}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                  }}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                {!!errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused === "password" && styles.inputFocused,
                    !!errors.password && styles.inputError,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={STONE_400}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                    if (confirmPassword && t !== confirmPassword) {
                      setErrors((e) => ({
                        ...e,
                        confirmPassword: "Passwords do not match",
                      }));
                    } else if (confirmPassword) {
                      setErrors((e) => ({ ...e, confirmPassword: undefined }));
                    }
                  }}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                {!!errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    focused === "confirmPassword" && styles.inputFocused,
                    !!errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={STONE_400}
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (!t) {
                      setErrors((e) => ({ ...e, confirmPassword: undefined }));
                    } else if (t !== password) {
                      setErrors((e) => ({
                        ...e,
                        confirmPassword: "Passwords do not match",
                      }));
                    } else {
                      setErrors((e) => ({ ...e, confirmPassword: undefined }));
                    }
                  }}
                  onFocus={() => setFocused("confirmPassword")}
                  onBlur={() => setFocused(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="done"
                  // Pressing "done" on keyboard also dismisses it cleanly
                  onSubmitEditing={Keyboard.dismiss}
                />
                {!!errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Submit */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Generate My Recipes</Text>
                )}
              </Pressable>
            </View>

            {/* ── Social ── */}
            <View style={styles.socialSection}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <AntDesign name="google" size={20} color="#4285F4" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
            </View>

            {/* ── Footer ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/sign-in")}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: STONE_100,
  },
  glassScroll: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  inner: {
    width: "100%",
    maxWidth: 384,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontFamily: "PlayfairDisplay_600SemiBold_Italic",
    fontSize: 36,
    color: STONE_800,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: STONE_600,
    marginTop: 8,
  },

  // Form
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: STONE_500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: STONE_800,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    backgroundColor: "#ffffff",
    borderColor: TERRACOTTA,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#ef4444",
    marginLeft: 4,
  },

  // Submit button
  submitButton: {
    backgroundColor: TERRACOTTA,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: TERRACOTTA,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: TERRACOTTA_DARK,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#ffffff",
  },

  // Social section
  socialSection: {
    marginTop: 32,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: STONE_300,
  },
  dividerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: STONE_500,
    textTransform: "uppercase",
    paddingHorizontal: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: STONE_200,
    borderRadius: 16,
    paddingVertical: 12,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: STONE_700,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: STONE_500,
  },
  footerLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: TERRACOTTA,
  },
});