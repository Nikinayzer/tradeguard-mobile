import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight, 
  User, 
  Shield, 
  Bell, 
  FileText, 
  HelpCircle, 
  Moon, 
  Sun, 
  Smartphone,
  LogOut,
  Lock,
  DollarSign
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { SettingsStackParamList } from '@/navigation/navigation';
import Constants from 'expo-constants';
import CustomAlert, { useAlert } from '@/components/common/CustomAlert';
import {useAuth} from "@/contexts/AuthContext"

type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsScreen() {
  const { colors, themePreference, setColorScheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { alert, showAlert, hideAlert } = useAlert();
  const {logout} = useAuth();
  
  const renderSettingsItem = (
    title: string, 
    icon: React.ReactNode, 
    onPress: () => void,
    rightElement?: React.ReactNode,
    subtitle?: string,
    isDestructive?: boolean,
    isDisabled?: boolean
  ) => (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled}
    >
      <ThemedView 
        variant="card" 
        style={{
          ...styles.settingsCard,
          ...(isDisabled ? { opacity: 0.6 } : {})
        }}
        rounded="medium"
      >
        <View style={styles.settingsItemLeft}>
          <View style={styles.iconContainer}>
            {React.cloneElement(icon as React.ReactElement, {
              size: 22, 
              color: isDestructive ? colors.error : colors.primary,
              strokeWidth: 2
            })}
          </View>
          
          <View style={styles.titleContainer}>
            <ThemedText 
              variant="bodyBold" 
              color={isDestructive ? colors.error : undefined}
            >
              {title}
            </ThemedText>
            
            {subtitle && (
              <ThemedText variant="caption" secondary>
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>
        
        {rightElement || (
          isDisabled ? 
          <Lock size={18} color={colors.textTertiary} /> : 
          <ChevronRight size={20} color={isDestructive ? colors.error : colors.textTertiary} />
        )}
      </ThemedView>
    </TouchableOpacity>
  );

  const renderThemeSelector = () => (
    <ThemedView 
      variant="card" 
      style={{
        ...styles.settingsCard,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
        padding: 6,
        paddingVertical: 10,
      }}
      rounded="medium"
    >
      <TouchableOpacity 
        style={styles.themeOption}
        onPress={() => setColorScheme('light')}
        activeOpacity={0.7}
      >
        <View style={styles.themeOptionContent}>
          <Sun 
            size={23} 
            color={themePreference === 'light' ? colors.primary : colors.textSecondary} 
          />
          <ThemedText 
            variant="caption" 
            color={themePreference === 'light' ? colors.primary : colors.textSecondary}
            style={styles.themeLabel}
          >
            Light
          </ThemedText>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.themeOption}
        onPress={() => setColorScheme('dark')}
        activeOpacity={0.7}
      >
        <View style={styles.themeOptionContent}>
          <Moon 
            size={23} 
            color={themePreference === 'dark' ? colors.primary : colors.textSecondary} 
          />
          <ThemedText 
            variant="caption" 
            color={themePreference === 'dark' ? colors.primary : colors.textSecondary}
            style={styles.themeLabel}
          >
            Dark
          </ThemedText>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.themeOption}
        onPress={() => setColorScheme('system')}
        activeOpacity={0.7}
      >
        <View style={styles.themeOptionContent}>
          <Smartphone 
            size={23} 
            color={themePreference === 'system' ? colors.primary : colors.textSecondary} 
          />
          <ThemedText 
            variant="caption" 
            color={themePreference === 'system' ? colors.primary : colors.textSecondary}
            style={styles.themeLabel}
          >
            Auto
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
  
  const handleLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to log out of your account?',
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              console.log(error.toString())
            }
          },
          style: 'destructive'
        }
      ]
    });
  };
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <ThemedHeader
            title="Settings"
            titleVariant="heading2"
            canGoBack={true}
            onBack={() => navigation.goBack()}
        />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedText variant="label" secondary style={styles.sectionLabel} mb={8}>
          ACCOUNT
        </ThemedText>
        
        {renderSettingsItem(
          'Personal Information', 
          <User />,
          () => navigation.navigate('PersonalInfo'),
          undefined,
          'Manage your profile details'
        )}
        
        {renderSettingsItem(
          'Security', 
          <Shield />,
          () => navigation.navigate('Security'),
          undefined,
          'Password, 2FA, and security options',
          false,
          false
        )}
        
        {renderSettingsItem(
          'Notifications', 
          <Bell />,
          () => navigation.navigate('Notifications'),
          undefined,
          'Configure alerts and notifications'
        )}
        
        {renderSettingsItem(
          'Account Limits', 
          <DollarSign />,
          () => navigation.navigate('AccountLimits'),
          undefined,
          'Set trading and account limits'
        )}
        
        <ThemedText variant="label" secondary style={styles.sectionLabel} mb={8} mt={8}>
          SUPPORT
        </ThemedText>
        
        {renderSettingsItem(
          'Terms of Service', 
          <FileText />,
          () => {},
          undefined,
          'Legal terms of using our service',
          false,
          true
        )}
        
        {renderSettingsItem(
          'Privacy Policy', 
          <FileText />,
          () => {},
          undefined,
          'How we handle your data',
          false,
          true
        )}
        
        {renderSettingsItem(
          'Help & Support', 
          <HelpCircle />,
          () => {},
          undefined,
          'Contact support and FAQs',
          false,
          true
        )}
        
        <ThemedText variant="label" secondary style={styles.sectionLabel} mb={8} mt={8}>
          APPEARANCE
        </ThemedText>
        {renderThemeSelector()}
        
        <View style={styles.spacer} />
        <View style={styles.spacer} />
        
        <View style={styles.logoutContainer}>
          <ThemedButton
            variant="secondary"
            size="large"
            fullWidth
            leftIcon={<LogOut size={20} />}
            textColor="white"
            style={{ backgroundColor: 'rgba(223,46,67,0.85)' }}
            onPress={handleLogout}
          >
            LOGOUT
          </ThemedButton>
        </View>
        <ThemedView 
          variant="transparent" 
          style={styles.versionContainer}
        >
          <ThemedText variant="caption" secondary>
            Version {Constants.expoConfig?.version || '1.0.0'}
          </ThemedText>
        </ThemedView>
      </ScrollView>
      
      {alert && <CustomAlert {...alert} onClose={hideAlert} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    paddingLeft: 4,
    letterSpacing: 1,
  },
  settingsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  themeOption: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    paddingVertical: 6,
  },
  themeOptionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    gap: 4,
  },
  versionContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  spacer: {
    height: 8,
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 16,
  }
}); 