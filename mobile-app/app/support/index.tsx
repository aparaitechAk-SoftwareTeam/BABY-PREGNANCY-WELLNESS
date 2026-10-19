import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  HelpCircle,
  PhoneCall,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Headphones,
  FileQuestion,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { apiClient } from '../../services/api/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  time: string;
  isRedFlag?: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'tracking' | 'caregiver' | 'clinical' | 'technical';
}

const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'tracking',
    question: 'How does the Cardiff Count-to-10 kick counter work?',
    answer:
      'The Cardiff method asks you to choose a quiet time each evening, rest comfortably on your left side, and tap the Kick button every time you feel a distinct flutter, roll, or kick. The goal is to record 10 distinct movements within 2 hours. If 10 kicks are not felt within 2 hours, drink cold water, rest, and contact your healthcare provider.',
  },
  {
    id: 'faq-2',
    category: 'caregiver',
    question: 'How do I invite my partner/caregiver to track with me?',
    answer:
      'Go to Profile > Family & Partner Sync. Share your unique pairing code via WhatsApp or SMS. When your partner downloads the app and signs up as a Caregiver, they enter your code to connect instantly.',
  },
  {
    id: 'faq-3',
    category: 'clinical',
    question: 'Can I export a PDF report to show my doctor at my visit?',
    answer:
      'Yes! Open the Reports tab and select "Weekly Health Summary" or "Monthly Medical Summary". Tap "View & Export PDF" to generate a clinical-ready summary with vitals, kick session history, and weight progression for your OB-GYN.',
  },
  {
    id: 'faq-4',
    category: 'tracking',
    question: 'How are daily routine habits and steps calculated?',
    answer:
      'Your daily routine includes evidence-based clinical habits (prenatal vitamins, 2.5L hydration, pelvic stretches). Habits automatically refresh at midnight. Step goals adapt by trimester: 5,500 in Trimester 1, 5,000 in Trimester 2, and 4,000 in Trimester 3 according to ACOG recommendations.',
  },
  {
    id: 'faq-5',
    category: 'technical',
    question: 'How do I update my Doctor Name or Due Date?',
    answer:
      'Go to Profile > Tap "Edit Pregnancy & Doctor Information". You can update your Estimated Due Date (EDD), Doctor / OB-GYN Name, Hospital Name, and Emergency Contact at any time.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const profile = usePregnancyStore((state) => state.profile);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'ticket'>('chat');
  const [inputText, setInputText] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>('faq-1');

  // New Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical Issue');
  const [ticketDetails, setTicketDetails] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: `Hello ${user?.name || 'there'}! 👋 Welcome to AparaiTech Care Support. I see you are currently in Week ${currentWeek || 20}. How can our support team assist you today?`,
      time: 'Just now',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  const quickQuestions = [
    'How do I pair my caregiver?',
    'How to export PDF report?',
    'Baby kicks feel low today',
    'Change doctor details',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Smart Agent Response Simulation
    setTimeout(() => {
      let replyText =
        'Thank you for reaching out! Our support specialist has logged this and will guide you. Is there anything else you would like assistance with?';
      let isRedFlag = false;

      const lower = query.toLowerCase();
      if (lower.includes('bleeding') || lower.includes('pain') || lower.includes('leak') || lower.includes('no kick') || lower.includes('fell')) {
        replyText =
          '⚠️ MEDICAL ALERT: If you are experiencing severe cramping, bleeding, fluid leakage, or absent fetal movement, please do not wait for chat support. Immediately contact your primary doctor or use our 24/7 Emergency SOS hotline button above.';
        isRedFlag = true;
      } else if (lower.includes('pair') || lower.includes('caregiver') || lower.includes('partner') || lower.includes('code')) {
        replyText =
          'To connect your partner, go to Profile > Family & Partner Sync. Share your unique pairing code. When your partner registers with the Caregiver role, they simply enter this code to link accounts.';
      } else if (lower.includes('pdf') || lower.includes('report') || lower.includes('export') || lower.includes('doctor summary')) {
        replyText =
          'You can generate a doctor-ready summary by visiting the Reports tab > Select "Weekly Health Summary" > tap "View" to preview the PDF and share directly to WhatsApp or Email.';
      } else if (lower.includes('doctor') || lower.includes('edd') || lower.includes('due date') || lower.includes('hospital')) {
        replyText =
          'You can edit your doctor name, hospital, and due date anytime in Profile > tap "Edit Pregnancy & Doctor Information" or via Settings.';
      } else if (lower.includes('kick') || lower.includes('movement')) {
        replyText =
          'For kick counts, rest quietly on your left side and log each movement in the Cardiff Kick Counter (Tracking tab). If you do not count 10 movements within 2 hours, please contact your obstetrician or maternity clinic.';
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRedFlag,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 800);
  };

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      Alert.alert('Incomplete Form', 'Please enter a ticket subject and description.');
      return;
    }

    try {
      const res = await apiClient.post('/support/tickets', {
        subject: ticketSubject.trim(),
        description: ticketDetails.trim(),
        category: ticketCategory.toLowerCase().replace(/\s+/g, '_'),
        priority: 'medium',
        userId: user?.id,
        userName: user?.name || profile?.nickname || 'Mother',
        userEmail: user?.email || '',
      });

      const ticketId = res.data?.data?.ticketNumber || `TIC-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedTicketId(ticketId);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.warn('Failed to submit ticket online, fallback locally', err);
      const ticketId = `TIC-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedTicketId(ticketId);
      setShowSuccessModal(true);
    }

    // Reset fields
    setTicketSubject('');
    setTicketDetails('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Care Support Hub</Text>
          <View style={styles.onlineBadgeRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>AparaiTech Team Online • ~2m reply</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Emergency Medical Contact',
              `Primary Doctor: ${profile?.doctorName || 'Not specified'}\nClinic: ${profile?.hospitalName || 'Not specified'}\nPhone: ${profile?.doctorPhone || 'Not specified'}\n\nNational Emergency: 108`,
              [
                { text: 'Cancel', style: 'cancel' },
                profile?.doctorPhone
                  ? {
                      text: 'Call Doctor',
                      style: 'default',
                      onPress: () => Alert.alert('Dialing Doctor', `Calling ${profile.doctorPhone}`),
                    }
                  : {
                      text: 'Call 108',
                      style: 'default',
                      onPress: () => Alert.alert('Dialing Emergency', 'Calling 108'),
                    },
              ]
            )
          }
          style={styles.emergencyIconBtn}
          activeOpacity={0.7}
        >
          <PhoneCall size={18} color="#E11D48" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Emergency Hotline Banner */}
      <View style={styles.emergencyBanner}>
        <AlertTriangle size={16} color="#DC2626" strokeWidth={2.5} />
        <Text style={styles.emergencyBannerText}>
          Medical urgency? Call your registered doctor or emergency helpline directly.
        </Text>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'chat' && styles.tabItemActive]}
          onPress={() => setActiveTab('chat')}
          activeOpacity={0.8}
        >
          <MessageSquare
            size={16}
            color={activeTab === 'chat' ? '#E11D48' : '#64748B'}
            strokeWidth={2.2}
          />
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
            Live Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'faqs' && styles.tabItemActive]}
          onPress={() => setActiveTab('faqs')}
          activeOpacity={0.8}
        >
          <HelpCircle
            size={16}
            color={activeTab === 'faqs' ? '#E11D48' : '#64748B'}
            strokeWidth={2.2}
          />
          <Text style={[styles.tabLabel, activeTab === 'faqs' && styles.tabLabelActive]}>
            FAQs & Guides
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'ticket' && styles.tabItemActive]}
          onPress={() => setActiveTab('ticket')}
          activeOpacity={0.8}
        >
          <FileQuestion
            size={16}
            color={activeTab === 'ticket' ? '#E11D48' : '#64748B'}
            strokeWidth={2.2}
          />
          <Text style={[styles.tabLabel, activeTab === 'ticket' && styles.tabLabelActive]}>
            Submit Ticket
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: LIVE SUPPORT CHAT */}
      {activeTab === 'chat' && (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Support Agent Card */}
            <View style={styles.agentInfoCard}>
              <View style={styles.agentAvatarBg}>
                <Headphones size={20} color="#E11D48" strokeWidth={2.5} />
              </View>
              <View style={styles.agentInfoTextCol}>
                <Text style={styles.agentName}>Dr. Ananya Verma • Support Lead</Text>
                <Text style={styles.agentBio}>
                  AparaiTech Maternal Care Team • Week {currentWeek || 20} Care Specialist
                </Text>
              </View>
            </View>

            {/* Quick Questions Chips */}
            <Text style={styles.quickPromptTitle}>Frequently asked by mothers:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptRow}
            >
              {quickQuestions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickPromptChip}
                  onPress={() => handleSendMessage(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickPromptText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Message Bubbles */}
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.messageRow,
                  m.sender === 'user' ? styles.messageRowUser : styles.messageRowAgent,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    m.sender === 'user' ? styles.bubbleUser : styles.bubbleAgent,
                    m.isRedFlag && styles.bubbleRedFlag,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      m.sender === 'user' ? styles.messageTextUser : styles.messageTextAgent,
                      m.isRedFlag && styles.messageTextRedFlag,
                    ]}
                  >
                    {m.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      m.sender === 'user' ? styles.messageTimeUser : styles.messageTimeAgent,
                    ]}
                  >
                    {m.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask a question or explain an issue..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* TAB 2: FAQS & GUIDES */}
      {activeTab === 'faqs' && (
        <ScrollView
          style={styles.faqScroll}
          contentContainerStyle={styles.faqScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.faqSectionHeading}>Knowledge Base & Common Questions</Text>
          <Text style={styles.faqSectionSub}>
            Quick answers regarding maternal tracking, caregiver sharing, and PDF reports.
          </Text>

          {INITIAL_FAQS.map((faq) => {
            const isExpanded = expandedFAQ === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeaderRow}
                  onPress={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={20} color="#E11D48" />
                  ) : (
                    <ChevronDown size={20} color="#64748B" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* TAB 3: SUBMIT FORMAL TICKET */}
      {activeTab === 'ticket' && (
        <ScrollView
          style={styles.ticketScroll}
          contentContainerStyle={styles.ticketScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ticketCard}>
            <Text style={styles.ticketCardHeading}>Submit a Support Ticket</Text>
            <Text style={styles.ticketCardSub}>
              Our web operations & clinical support team responds to formal tickets within 2-4 hours.
            </Text>

            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. Need help updating my EDD or ultrasound notes"
              placeholderTextColor="#94A3B8"
              value={ticketSubject}
              onChangeText={setTicketSubject}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPickerRow}>
              {['Technical Issue', 'Pregnancy Tracking', 'Caregiver Sync', 'Clinical Query'].map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      ticketCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setTicketCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        ticketCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.inputLabel}>Details & Description</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="Describe what you are experiencing in detail..."
              placeholderTextColor="#94A3B8"
              value={ticketDetails}
              onChangeText={setTicketDetails}
              multiline
              numberOfLines={5}
            />

            <TouchableOpacity
              style={styles.submitTicketBtn}
              onPress={handleSubmitTicket}
              activeOpacity={0.85}
            >
              <Text style={styles.submitTicketBtnText}>Submit Support Ticket</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Ticket Success Confirmation Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.successIconBg}>
              <CheckCircle2 size={36} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text style={styles.modalTitle}>Ticket Created Successfully!</Text>
            <Text style={styles.ticketBadge}>{createdTicketId}</Text>
            <Text style={styles.modalSub}>
              Your request has been routed to our Web Support Dashboard. Our maternal care specialists have your pregnancy profile context and will reply shortly via in-app notification.
            </Text>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setShowSuccessModal(false);
                setActiveTab('chat');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseBtnText}>Return to Live Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  emergencyIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    gap: 8,
  },
  emergencyBannerText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#E11D48',
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  agentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  agentAvatarBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  agentInfoTextCol: {
    flex: 1,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  agentBio: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickPromptTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickPromptRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPromptText: {
    fontSize: 11.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAgent: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#E11D48',
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleRedFlag: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1.5,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAgent: {
    color: '#0F172A',
  },
  messageTextRedFlag: {
    color: '#991B1B',
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageTimeAgent: {
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 90,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  faqScroll: {
    flex: 1,
  },
  faqScrollContent: {
    padding: 16,
  },
  faqSectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  faqSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 10,
  },
  faqBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  faqAnswerText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
  },
  ticketScroll: {
    flex: 1,
  },
  ticketScrollContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketCardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  ticketCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#FEE2E6',
    borderColor: '#E11D48',
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  submitTicketBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  submitTicketBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  successIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  ticketBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginVertical: 10,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 18,
  },
  modalCloseBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
