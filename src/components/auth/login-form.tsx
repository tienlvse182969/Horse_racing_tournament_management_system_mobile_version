import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

import { HorseRacingDark as C, Spacing, FontFamily } from '@/constants/theme';

type Props = {
  email: string;
  password: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
};

export function LoginForm({ email, password, onEmailChange, onPasswordChange }: Props) {
  const [pwVisible, setPwVisible] = useState(false);

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.form}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email-outline" />}
      />
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={onPasswordChange}
        mode="outlined"
        secureTextEntry={!pwVisible}
        left={<TextInput.Icon icon="lock-outline" />}
        right={
          <TextInput.Icon
            icon={pwVisible ? 'eye-off-outline' : 'eye-outline'}
            onPress={() => setPwVisible(v => !v)}
          />
        }
      />
      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  form:       { gap: Spacing.two, marginBottom: Spacing.two },
  forgotBtn:  { alignSelf: 'flex-end', paddingVertical: Spacing.one },
  forgotText: { color: C.primary, fontFamily: FontFamily.medium, fontSize: 13 },
});
