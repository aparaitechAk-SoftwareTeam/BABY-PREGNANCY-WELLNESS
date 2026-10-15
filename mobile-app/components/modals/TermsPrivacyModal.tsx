import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';

interface TermsPrivacyModalProps {
  visible: boolean;
  type: 'terms' | 'privacy';
  onClose: () => void;
}

const TERMS_CONTENT = `
TERMS OF USE

Last Updated: October 2026

1. ACCEPTANCE OF TERMS
By accessing and using the AparaiTech Pregnancy Wellness application ("App"), you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily download one copy of the materials (information or software) on AparaiTech's App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.

3. DISCLAIMER
The materials on AparaiTech's App are provided "as-is". AparaiTech makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. CLINICAL DISCLAIMER
The App is a wellness companion tool and is NOT a substitute for professional medical advice. Always consult your healthcare provider before making any decisions based on information from this App.

5. LIMITATIONS
In no event shall AparaiTech or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AparaiTech's App.

6. ACCURACY OF MATERIALS
The materials appearing on AparaiTech's App could include technical, typographical, or photographic errors. AparaiTech does not warrant that any of the materials on our App are accurate, complete, or current.

7. MODIFICATIONS
AparaiTech may revise these terms of use for our App at any time without notice. By using this App, you are agreeing to be bound by the then current version of these terms of use.

8. GOVERNING LAW
These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.

9. USER RIGHTS
You retain all rights to any content you submit, post or display on or through the App. By submitting content, you grant AparaiTech a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content in any media or medium.

10. CONTACT INFORMATION
If you have any questions about these Terms of Use, please contact us at support@aparaitech.com
`;

const PRIVACY_CONTENT = `
PRIVACY POLICY

Last Updated: October 2026

1. INFORMATION WE COLLECT
We collect information you provide directly:
- Registration information (name, email, phone number)
- Pregnancy and health tracking data
- Maternal vitals (blood pressure, weight, hydration)
- Fetal kick counts and movement tracking
- Appointment information
- Family member details for sharing

2. HOW WE USE YOUR INFORMATION
Your information is used to:
- Provide and improve our services
- Send you notifications and updates
- Track your pregnancy progress
- Share data with family members (with your consent)
- Analyze trends to improve maternal health outcomes
- Comply with legal obligations

3. DATA SECURITY
We implement industry-standard security measures:
- 256-bit SSL encryption for all data in transit
- End-to-end encryption for sensitive information
- Secure password hashing and storage
- Regular security audits and updates

4. DATA SHARING
We do NOT sell your data. Your data is shared only with:
- Family members you explicitly invite
- Healthcare providers you authorize
- Legal authorities if required by law

5. HIPAA & GDPR COMPLIANCE
This App is compliant with:
- HIPAA (Health Insurance Portability and Accountability Act)
- GDPR (General Data Protection Regulation)
- DPDP (Digital Personal Data Protection Act) - India

6. YOUR RIGHTS
You have the right to:
- Access your personal data
- Correct inaccurate information
- Delete your account and data
- Export your data
- Opt-out of communications
- Request information about data sharing

7. THIRD-PARTY SERVICES
We use third-party services for:
- Cloud storage and backup
- Analytics (privacy-focused)
- Push notifications
- Payment processing

These services are bound by strict confidentiality agreements.

8. CHILDREN'S PRIVACY
The App is intended for adults only. We do not knowingly collect data from children under 13.

9. CHANGES TO PRIVACY POLICY
We may update this privacy policy periodically. We will notify you of significant changes via email or app notification.

10. CONTACT US
For privacy concerns, contact: privacy@aparaitech.com
Data Protection Officer: dpo@aparaitech.com
`;

export function TermsPrivacyModal({ visible, type, onClose }: TermsPrivacyModalProps) {
  const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;
  const title = type === 'terms' ? 'Terms of Use' : 'Privacy Policy';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={true}>
          <Text style={styles.contentText}>{content}</Text>
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.closeActionButton}>
            <Text style={styles.closeActionButtonText}>I Understand & Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  closeActionButton: {
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
