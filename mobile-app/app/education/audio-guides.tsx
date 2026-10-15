import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Headphones,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart,
  CheckCircle2,
} from 'lucide-react-native';
import { useLanguageStore, SupportedLanguage, TRANSLATIONS } from '../../store/language.store';

interface AudioTrack {
  id: string;
  duration: string;
  durationSec: number;
  titles: Record<SupportedLanguage, string>;
  descriptions: Record<SupportedLanguage, string>;
  transcripts: Record<SupportedLanguage, string>;
  category: string;
  emoji: string;
}

const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'track-nutrition',
    duration: '4:15',
    durationSec: 255,
    category: 'Nutrition & Supplements',
    emoji: '🥗',
    titles: {
      en: 'Trimester 2 Nutrition: Iron & Calcium Absorption',
      hi: 'दूसरी तिमाही में पोषण: आयरन और कैल्शियम का संतुलन',
      mr: 'दुसऱ्या तिमाहीतील आहार: लोह आणि कॅल्शियमचे योग्य शोषण',
    },
    descriptions: {
      en: 'Why taking iron supplements with citrus juice improves absorption, and why calcium should be spaced 2 hours apart.',
      hi: 'नींबू पानी के साथ आयरन लेने के फायदे और आयरन तथा कैल्शियम के बीच 2 घंटे का अंतर क्यों जरूरी है।',
      mr: 'लिंबू पाण्यासोबत लोह घेतल्याने शोषण कसे वाढते आणि लोह व कॅल्शियममध्ये २ तासांचे अंतर का ठेवावे.',
    },
    transcripts: {
      en: 'Welcome to this clinical guidance on prenatal nutrition. During the second trimester, maternal blood volume expands by nearly 50%, making iron vital for oxygen delivery to your growing baby. Always take your iron tablet with vitamin C rich fluids like orange or lemon water. Avoid tea, coffee, or milk within 2 hours of taking iron, as calcium binds to iron and prevents its clinical absorption.',
      hi: 'गर्भावस्था पोषण मार्गदर्शन में आपका स्वागत है। दूसरी तिमाही में शरीर में रक्त की मात्रा लगभग 50% बढ़ जाती है, जिससे शिशु के विकास के लिए आयरन अत्यंत आवश्यक हो जाता है। आयरन की गोली हमेशा नींबू पानी या संतरा रस के साथ लें। आयरन लेने के 2 घंटे पहले और बाद में चाय, कॉफी या दूध न पिएं।',
      mr: 'गर्भावस्था आहार मार्गदर्शनामध्ये आपले स्वागत आहे. दुसऱ्या तिमाहीत शरीरातील रक्ताचे प्रमाण जवळपास ५० टक्क्यांनी वाढते, ज्यामुळे बाळाच्या विकासासाठी लोह अतिशय महत्त्वाचे ठरते. लोहाची गोळी नेहमी लिंबू पाणी किंवा संत्र्याच्या रसासोबत घ्या. लोहाचे सेवन करताना चहा, कॉफी किंवा दूध किमान २ तास टाळा.',
    },
  },
  {
    id: 'track-kicks',
    duration: '3:40',
    durationSec: 220,
    category: 'Fetal Monitoring',
    emoji: '🦶',
    titles: {
      en: 'Cardiff Fetal Kick Counting: Daily Practice',
      hi: 'कार्डिफ विधि: शिशु की दैनिक हलचल कैसे गिनें',
      mr: 'कार्डिफ पद्धत: बाळाच्या हालचाली रोज कशा मोजाव्यात',
    },
    descriptions: {
      en: 'Step-by-step guidance on choosing a quiet evening hour and resting on your left side to record 10 distinct movements.',
      hi: 'शांत समय में बाईं करवट लेटकर शिशु की 10 हलचलें 2 घंटे में गिनने का सही और सुरक्षित तरीका।',
      mr: 'संध्याकाळी डाव्या कुशीवर झोपून २ तासांत बाळाच्या १० हालचाली मोजण्याची सोपी आणि वैद्यकीय पद्धत.',
    },
    transcripts: {
      en: 'Fetal movement is the clearest indicator of your baby’s wellbeing. By Week 20 to 24, movements transition from gentle flutters into distinct kicks. Choose the evening when babies are most active. Rest on your left side to optimize blood flow through the uterine arteries. Open the Cardiff Kick Counter in your app and tap for each kick until you reach 10.',
      hi: 'शिशु की हलचल उसके स्वास्थ्य का सबसे बड़ा संकेत है। 20वें सप्ताह के बाद शिशु की हलचल स्पष्ट रूप से महसूस होने लगती है। शाम का समय चुनें जब शिशु सबसे ज्यादा सक्रिय होता है। बाईं करवट लेटें जिससे गर्भाशय में रक्त संचार उत्तम रहता है। ऐप में किक बटन दबाएं और 10 हलचलें पूरी करें।',
      mr: 'बाळाची हालचाल हे बाळाच्या चांगल्या आरोग्याचे प्रमुख लक्षण आहे. २० व्या आठवड्यानंतर बाळाच्या हालचाली स्पष्ट जाणवू लागतात. संध्याकाळी डाव्या कुशीवर झोपून शांत बसा. डाव्या कुशीवर झोपल्याने गर्भाशयाला रक्तपुरवठा उत्तम होतो. ॲपमधील किक काउंटर उघडा आणि १० हालचाली मोजा.',
    },
  },
  {
    id: 'track-breathing',
    duration: '5:10',
    durationSec: 310,
    category: 'Relaxation & Pelvic Health',
    emoji: '🧘‍♀️',
    titles: {
      en: 'Prenatal Deep Breathing & Pelvic Relaxation',
      hi: 'गर्भावस्था में शांत श्वसन और पेल्विक विश्रांती',
      mr: 'सुरक्षित प्रसूतीपूर्व श्वसन आणि पेल्विक व्यायाम',
    },
    descriptions: {
      en: 'Guided 5-minute diaphragmatic breathing exercise to lower maternal cortisol and relieve lower back tension.',
      hi: 'पीठ दर्द और तनाव कम करने के लिए 5 मिनट का शांत और सुरक्षित प्राणायाम व ध्यान।',
      mr: 'कंबरदुखी आणि मानसिक ताण कमी करण्यासाठी ५ मिनिटांचे सुरक्षित श्वसन तंत्र.',
    },
    transcripts: {
      en: 'Sit comfortably with your back supported by pillows. Place one hand on your chest and one on your belly. Inhale deeply through your nose for 4 counts, allowing your belly to expand gently. Exhale slowly through your mouth for 6 counts. Feel your pelvic floor muscles release all tension with each breath.',
      hi: 'आरामदायक स्थिति में बैठें और पीठ के पीछे तकिया लगाएं। एक हाथ छाती पर और दूसरा पेट पर रखें। नाक से 4 सेकंड तक गहरी सांस लें जिससे पेट धीरे से फूले। फिर मुंह से 6 सेकंड तक धीरे-धीरे सांस छोड़ें। हर सांस के साथ पेल्विक मांसपेशियों का तनाव दूर करें।',
      mr: 'पाठीमागे उशी ठेवून शांत बसा. एक हात छातीवर आणि दुसरा पोटावर ठेवा. नाकाने ४ सेकंद खोल श्वास घ्या आणि पोटाला हलका फुगवू द्या. नंतर तोंडाने ६ सेकंद हळूहळू श्वास सोडा. प्रत्येक श्वासासोबत पेल्विक स्नायूंवरील ताण सैल करा.',
    },
  },
  {
    id: 'track-warnings',
    duration: '3:15',
    durationSec: 195,
    category: 'Clinical Safety Protocol',
    emoji: '🚨',
    titles: {
      en: 'Recognizing Urgent Maternal Warning Signs',
      hi: 'आपातकालीन गर्भावस्था लक्षण जिन्हें नजरअंदाज न करें',
      mr: 'गर्भावस्थेतील तातडीचे धोक्याचे संकेत आणि खबरदारी',
    },
    descriptions: {
      en: 'Red-flag clinical signs: vaginal bleeding, fluid leakage, sudden facial swelling, or severe headache.',
      hi: 'रक्तस्राव, पानी छूटना, चेहरे पर अचानक सूजन या गंभीर सिरदर्द होने पर तुरंत डॉक्टर से संपर्क करें।',
      mr: 'रक्तस्राव, पाण्याची गळती, चेहऱ्यावर अचानक सूज किंवा तीव्र डोकेदुखी झाल्यास तात्काळ डॉक्टरांशी संपर्क साधा.',
    },
    transcripts: {
      en: 'While most pregnancy symptoms are completely normal, certain signs require immediate medical attention. If you notice any bright red vaginal bleeding, sudden gush of clear fluid, severe headache with blurred vision, or if your baby moves significantly less than normal, do not wait. Contact your obstetrician or hospital casualty immediately.',
      hi: 'अधिकांश गर्भावस्था लक्षण सामान्य होते हैं, परंतु कुछ लक्षणों पर तुरंत डॉक्टर से मिलना आवश्यक है। यदि आपको लाल रक्तस्राव, पानी का रिसाव, धुंधली दृष्टि के साथ तेज सिरदर्द या शिशु की कम हलचल लगे, तो बिना देरी किए अपने डॉक्टर या अस्पताल से संपर्क करें।',
      mr: 'गर्भावस्थेतील बहुतांश लक्षणे सामान्य असली तरी काही लक्षणांवर तात्काळ वैद्यकीय उपचारांची गरज असते. लाल रक्तस्राव, पाण्याचा स्त्राव, डोळ्यांसमोर अंधारी येऊन तीव्र डोकेदुखी किंवा बाळाची हालचाल अचानक मंदावल्यास क्षणाचाही विलंब न करता डॉक्टरांना भेटा.',
    },
  },
];

export default function AudioGuidesScreen() {
  const router = useRouter();
  const { currentLanguage, setLanguage, loadLanguage } = useLanguageStore();

  const [activeTrack, setActiveTrack] = useState<AudioTrack>(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [expandedTranscript, setExpandedTranscript] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  // Timer simulation for audio playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= activeTrack.durationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectTrack = (track: AudioTrack) => {
    setActiveTrack(track);
    setPlaybackSeconds(0);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (sec: number) => {
    setPlaybackSeconds((prev) => Math.max(0, Math.min(activeTrack.durationSec, prev + sec)));
  };

  const t = TRANSLATIONS[currentLanguage];

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

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>{t.audioGuides}</Text>
          <Text style={styles.headerSubtitle}>
            {currentLanguage === 'en'
              ? 'English • हिंदी • मराठी'
              : currentLanguage === 'hi'
              ? 'हिंदी • मराठी • English'
              : 'मराठी • हिंदी • English'}
          </Text>
        </View>

        <View style={styles.headphoneIconBox}>
          <Headphones size={20} color="#E11D48" strokeWidth={2.2} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection Bar */}
        <View style={styles.langSelectorContainer}>
          <Text style={styles.langLabel}>
            <Globe size={13} color="#64748B" /> Select Audio Language:
          </Text>
          <View style={styles.langPillsRow}>
            {[
              { code: 'en' as SupportedLanguage, label: 'English' },
              { code: 'hi' as SupportedLanguage, label: 'हिंदी (Hindi)' },
              { code: 'mr' as SupportedLanguage, label: 'मराठी (Marathi)' },
            ].map((l) => {
              const isSelected = currentLanguage === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langPill, isSelected && styles.langPillActive]}
                  onPress={() => setLanguage(l.code)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langPillText,
                      isSelected && styles.langPillTextActive,
                    ]}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Big Audio Player Hero Card */}
        <View style={styles.playerCard}>
          <View style={styles.playerTopRow}>
            <View style={styles.trackBadge}>
              <Text style={styles.trackBadgeEmoji}>{activeTrack.emoji}</Text>
              <Text style={styles.trackBadgeText}>{activeTrack.category}</Text>
            </View>
            <View style={styles.narratorPill}>
              <Text style={styles.narratorPillText}>🎙️ Clinical Audio</Text>
            </View>
          </View>

          <Text style={styles.playerTrackTitle}>
            {activeTrack.titles[currentLanguage]}
          </Text>
          <Text style={styles.playerTrackSub}>
            {activeTrack.descriptions[currentLanguage]}
          </Text>

          {/* Scrubber Progress Bar */}
          <View style={styles.scrubberContainer}>
            <View style={styles.scrubberTrack}>
              <View
                style={[
                  styles.scrubberFill,
                  {
                    width: `${Math.min(
                      100,
                      (playbackSeconds / activeTrack.durationSec) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.timeLabelsRow}>
              <Text style={styles.timeText}>{formatSeconds(playbackSeconds)}</Text>
              <Text style={styles.timeText}>{activeTrack.duration}</Text>
            </View>
          </View>

          {/* Player Controls (Rewind 10, Play/Pause, Forward 10) */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(-10)}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color="#0F172A" />
              <Text style={styles.skipSecText}>10s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={handleTogglePlay}
              activeOpacity={0.85}
            >
              {isPlaying ? (
                <Pause size={28} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <Play size={28} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(10)}
              activeOpacity={0.7}
            >
              <RotateCw size={20} color="#0F172A" />
              <Text style={styles.skipSecText}>10s</Text>
            </TouchableOpacity>
          </View>

          {/* Transcript Read-Along Accordion */}
          <TouchableOpacity
            style={styles.transcriptToggleBtn}
            onPress={() => setExpandedTranscript(!expandedTranscript)}
            activeOpacity={0.7}
          >
            <Text style={styles.transcriptToggleText}>
              {expandedTranscript ? 'Hide Read-Along Transcript' : '📖 Read Along in ' + (currentLanguage === 'en' ? 'English' : currentLanguage === 'hi' ? 'हिंदी' : 'मराठी')}
            </Text>
            {expandedTranscript ? (
              <ChevronUp size={16} color="#E11D48" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </TouchableOpacity>

          {expandedTranscript && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptContent}>
                {activeTrack.transcripts[currentLanguage]}
              </Text>
            </View>
          )}
        </View>

        {/* Audio Track Library */}
        <View style={styles.librarySection}>
          <Text style={styles.libraryHeading}>
            {currentLanguage === 'en'
              ? 'Complete Audio Library (4 Tracks)'
              : currentLanguage === 'hi'
              ? 'ऑडियो लाइब्रेरी (4 ट्रैक्स)'
              : 'संपूर्ण ऑडिओ ग्रंथालय (४ ऑडिओ)'}
          </Text>

          {AUDIO_TRACKS.map((track) => {
            const isCurrent = activeTrack.id === track.id;
            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackCard, isCurrent && styles.trackCardActive]}
                onPress={() => handleSelectTrack(track)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.trackPlayIconBox,
                    isCurrent && styles.trackPlayIconBoxActive,
                  ]}
                >
                  {isCurrent && isPlaying ? (
                    <Pause size={16} color="#FFFFFF" />
                  ) : (
                    <Play size={16} color={isCurrent ? '#FFFFFF' : '#E11D48'} />
                  )}
                </View>

                <View style={styles.trackInfoCol}>
                  <Text
                    style={[
                      styles.trackTitle,
                      isCurrent && styles.trackTitleActive,
                    ]}
                  >
                    {track.titles[currentLanguage]}
                  </Text>
                  <Text style={styles.trackCategoryText}>
                    {track.emoji} {track.category} • {track.duration}
                  </Text>
                </View>

                {isCurrent ? (
                  <View style={styles.playingIndicator}>
                    <Text style={styles.playingIndicatorText}>PLAYING</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  headphoneIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  langSelectorContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  langLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  langPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langPillActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  langPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  playerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  playerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  trackBadgeEmoji: {
    fontSize: 12,
  },
  trackBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  narratorPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  narratorPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  playerTrackTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 23,
    marginBottom: 6,
  },
  playerTrackSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 16,
  },
  scrubberContainer: {
    marginBottom: 18,
  },
  scrubberTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    marginBottom: 14,
  },
  skipBtn: {
    alignItems: 'center',
    gap: 2,
  },
  skipSecText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  playPauseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  transcriptToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  transcriptToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  transcriptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  transcriptContent: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#334155',
  },
  librarySection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  libraryHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trackCardActive: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFFBFB',
  },
  trackPlayIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackPlayIconBoxActive: {
    backgroundColor: '#E11D48',
  },
  trackInfoCol: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  trackTitleActive: {
    color: '#E11D48',
  },
  trackCategoryText: {
    fontSize: 11,
    color: '#64748B',
  },
  playingIndicator: {
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  playingIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.4,
  },
});
