import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useIsDark } from "@/context/ThemeContext";

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <View style={[styles.header, { borderBottomColor: C.border, paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.text }]}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.updated, { color: C.textSecondary }]}>
          Effective Date: April 22, 2026 | Last Updated: April 22, 2026
        </Text>

        <Text style={[styles.paragraph, { color: C.text }]}>
          This Privacy Policy explains how CuraDebt Systems, LLC ("CuraDebt," "we," "us," or "our") handles information in connection with the DebtPath mobile application (the "App"). By downloading, installing, or using the App, you acknowledge that you have read and understood this Privacy Policy.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Key Point: DebtPath is designed with privacy-by-default. The financial details you enter (debt balances, interest rates, income figures) are stored locally on your device. We do not receive or collect your account numbers, Social Security number, bank login credentials, or other sensitive personal financial information.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>Table of Contents</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          1. Scope and Who We Are{"\n"}
          2. Information We Collect{"\n"}
          3. Information We Do Not Collect{"\n"}
          4. How We Use Information{"\n"}
          5. Personalized Recommendations and Third-Party Offers{"\n"}
          6. How Information Is Shared{"\n"}
          7. Data Storage, Retention, and Deletion{"\n"}
          8. Account Deletion{"\n"}
          9. Security{"\n"}
          10. Children's Privacy{"\n"}
          11. California Privacy Rights (CCPA/CPRA){"\n"}
          12. Other U.S. State Privacy Rights{"\n"}
          13. International Users{"\n"}
          14. Third-Party Services Within the App{"\n"}
          15. Changes to This Policy{"\n"}
          16. How to Contact Us
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>1. Scope and Who We Are</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          This Privacy Policy applies only to the DebtPath mobile application and does not apply to any other website, product, or service offered by CuraDebt or any third party. CuraDebt Systems, LLC is a Florida limited liability company with a mailing address at 4000 Hollywood Blvd, Suite 555-S, Hollywood, FL 33021, United States.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          DebtPath is an educational and motivational tool that helps users plan debt payoff strategies using information they choose to enter. DebtPath is not a financial advisor, credit counselor, debt settlement company, lender, or loan broker. DebtPath does not provide financial, legal, tax, or credit counseling advice.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>2. Information We Collect</Text>
        <Text style={[styles.subheading, { color: C.text }]}>2.1 Information You Provide in the App</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          When you use DebtPath, you may enter information such as:
          {"\n"}- Self-reported debt balances, interest rates, minimum payments, and creditor categories (for example, "credit card" or "auto loan") - you are not required to enter actual creditor names or account numbers;
          {"\n"}- Self-reported monthly income or budget figures used to calculate payoff scenarios;
          {"\n"}- Goals, milestones, and progress you track within the App;
          {"\n"}- A display name or nickname you choose (optional).
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          This information is stored locally on your device. We do not upload, collect, or retain this data on our servers unless you expressly enable an optional cloud-sync feature (if and when such a feature is made available) and explicitly consent at that time.
        </Text>
        <Text style={[styles.subheading, { color: C.text }]}>2.2 Information Collected Automatically</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          When you use the App, we or our service providers may automatically collect limited technical and usage information, including:
          {"\n"}- Device type, operating system version, App version, language, and approximate region (country-level);
          {"\n"}- Anonymous or pseudonymous app-event data such as screens viewed, buttons tapped, features used, session length, crash reports, and performance metrics;
          {"\n"}- A non-persistent advertising identifier only if you have affirmatively granted App Tracking Transparency permission under iOS or the equivalent advertising-ID permission on Android. If you decline, no advertising identifier is collected.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          This automatic information is used to operate, maintain, secure, and improve the App. It is not used to identify you personally and is not combined with the financial details you enter on your device.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Where required by Apple, access to tracking-related identifiers is requested only after obtaining any necessary user permission through Apple's permission framework. If permission is denied, DebtPath will not access tracking identifiers for that purpose.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          For iOS users, the App Store listing may provide additional disclosures regarding the categories of data used by the App, including analytics, diagnostics, and any data linked or not linked to you. CuraDebt intends for those disclosures to accurately reflect the App's then-current data practices.
        </Text>
        <Text style={[styles.subheading, { color: C.text }]}>2.3 Information When You Contact Us</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          If you contact us by email or phone, we will receive the contact details you provide (such as your email address or phone number) and the contents of your message. We use this information to respond to your inquiry and to maintain reasonable business records.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>3. Information We Do Not Collect</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          To help you understand our privacy-by-default approach, we want to be explicit. DebtPath does not collect, request, or receive:
          {"\n"}- Your Social Security number, taxpayer identification number, driver's license number, or passport number;
          {"\n"}- Your bank account numbers, routing numbers, credit card numbers, or debit card numbers;
          {"\n"}- Your online banking, brokerage, or lender login credentials;
          {"\n"}- Your credit report, credit score, or credit bureau file;
          {"\n"}- Direct read-access to any financial institution account through aggregation services such as Plaid or Finicity, unless a future optional feature is added and you expressly authorize it at that time;
          {"\n"}- Your precise geolocation (GPS coordinates).
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          If you choose to enter a specific creditor name or account-related identifier in a free-text field, you do so at your own discretion. We recommend that you do not enter full account numbers, Social Security numbers, or login credentials anywhere in the App.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>4. How We Use Information</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          We and our service providers use the limited information described above for the following purposes:
          {"\n"}- To operate, maintain, and provide the App's features;
          {"\n"}- To diagnose crashes, fix bugs, and improve performance;
          {"\n"}- To understand which features are used and how the App can be improved;
          {"\n"}- To prevent fraud, abuse, and security incidents;
          {"\n"}- To generate personalized, in-App educational content and recommendations about debt management strategies and categories of third-party services that may be relevant to users in situations similar to the one you describe (see Section 5);
          {"\n"}- To comply with legal obligations, enforce our Terms of Service, and protect our legal rights.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>5. Personalized Recommendations and Third-Party Offers</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          DebtPath may use the information you enter on your device - together with publicly available information and aggregated benchmarks - to generate personalized educational content and to display categories of third-party products or services that may be relevant to your situation (for example, debt consolidation information, credit counseling resources, or tax relief information).
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          These recommendations are generated on your device using the information you have entered. We do not transmit your debt balances, income figures, or other financial details to any third party in order to produce these recommendations.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Important: If you choose to tap a link, offer, or referral within the App to learn more about or engage with a third-party service, you will be directed away from DebtPath to a third-party website, app, or landing page. At that point:
          {"\n"}- The third party's own privacy policy and terms of service apply;
          {"\n"}- Any information you submit on that third-party site or app is collected by and governed by that third party, not by CuraDebt;
          {"\n"}- CuraDebt may receive a referral fee, advertising compensation, or other consideration from the third party for referring traffic. This does not increase the price of any product or service offered by the third party;
          {"\n"}- CuraDebt does not endorse, guarantee, or assume responsibility for the practices, products, or services of any third party.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          You are solely responsible for reviewing and accepting any third party's privacy policy and terms before submitting information to them.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>6. How Information Is Shared</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          We do not sell, rent, or trade the personal information you enter in the App. We share limited information only as follows:
          {"\n"}- Service Providers. We use vendors to host infrastructure, deliver crash and analytics reports, provide customer support tools, and send transactional messages you request. These vendors are bound by contractual obligations to use your information only to provide services to us.
          {"\n"}- Legal and Safety. We may disclose information if required to comply with a valid subpoena, court order, or other legal process, to enforce our Terms of Service, to protect the rights, property, or safety of CuraDebt, our users, or others, or to prevent fraud or illegal activity.
          {"\n"}- Business Transfers. If CuraDebt is involved in a merger, acquisition, financing, reorganization, or sale of assets, information may be transferred as part of that transaction, subject to customary confidentiality protections.
          {"\n"}- With Your Direction. When you tap through to a third-party offer, the information you then choose to submit to that third party is not shared by us - it is submitted by you directly to the third party.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          We do not share the financial details you enter in the App with advertising networks for targeted advertising purposes.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>7. Data Storage, Retention, and Deletion</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          The debt and budget information you enter is stored locally on your device. When you delete the App from your device, that local information is deleted with it.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Automatic technical and usage information described in Section 2.2 is retained by us or our service providers for only as long as reasonably necessary for the purposes described in Section 4, typically no longer than 24 months, after which it is deleted or de-identified.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Contact records from correspondence with our support team are retained for as long as reasonably necessary to respond to your inquiry and to maintain business records, and then deleted or archived in accordance with our record retention practices.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>8. Account Deletion</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          DebtPath does not require you to create an account to use its core features. If a future version of the App introduces optional account-based features, you will be able to delete your account and associated information directly from within the App, in accordance with Apple App Store and Google Play requirements.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          If the App does not offer account creation, no account deletion workflow is required for core App use because core App data remains stored locally on your device unless and until an optional account-based or cloud-sync feature is introduced.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          To delete data that exists today:
          {"\n"}- Local data: Open the App, go to Settings, and tap "Reset All Data," or delete the App from your device.
          {"\n"}- Support correspondence or any cloud-synced data: Email management@curadebt.com from the address you used to contact us and write "DebtPath Data Deletion Request" in the subject line. We will process your request within 30 days, subject to identity verification and any legal retention obligations.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>9. Security</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          We use commercially reasonable administrative, technical, and physical safeguards designed to protect information under our control. However, no method of electronic storage or transmission is 100% secure. You are responsible for safeguarding your device and the credentials used to access it. Using the App on a shared or unsecured device may allow others to view the information you enter.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>10. Children's Privacy</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          DebtPath is intended for adults aged 18 and older. The App is not directed to children, and we do not knowingly collect personal information from anyone under 18. If we learn that we have inadvertently collected personal information from someone under 18, we will delete it. If you believe someone under 18 has provided us with personal information, please contact us at management@curadebt.com.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>11. California Privacy Rights (CCPA/CPRA)</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act, provides you with the following rights regarding personal information we collect about you:
          {"\n"}- Right to Know what categories of personal information we have collected, the sources, the purposes, and the categories of third parties with whom we share it;
          {"\n"}- Right to Access the specific pieces of personal information we hold about you;
          {"\n"}- Right to Delete personal information we hold about you, subject to legal exceptions;
          {"\n"}- Right to Correct inaccurate personal information;
          {"\n"}- Right to Limit Use of any sensitive personal information;
          {"\n"}- Right to Opt Out of the "sale" or "sharing" of personal information. We do not sell personal information, and we do not share personal information for cross-context behavioral advertising as those terms are defined under California law.
          {"\n"}- Right to Non-Discrimination for exercising any of these rights.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          To exercise any of these rights, email management@curadebt.com with the subject line "California Privacy Request." We will verify your identity before fulfilling your request. You may also authorize an agent to make a request on your behalf; we may require written proof of authorization.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Categories of personal information we have collected in the preceding 12 months include identifiers (such as device identifiers), internet or other electronic network activity information (such as App usage data), and, if you contacted us, contact information you provided. We have not sold or shared personal information for cross-context behavioral advertising in the preceding 12 months.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>12. Other U.S. State Privacy Rights</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          Residents of other U.S. states, including Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana, and others that have enacted consumer privacy laws, may have similar rights to access, correct, delete, or port their personal information, and to opt out of certain processing. To exercise these rights, contact us at management@curadebt.com. We will respond in accordance with applicable law.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>13. International Users</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          DebtPath is operated from the United States and is intended for users located in the United States. If you access the App from outside the United States, you understand that your information will be processed in the United States, which may have data protection laws different from those in your country. By using the App, you consent to this transfer and processing.
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          We do not actively market the App to residents of the European Economic Area, the United Kingdom, or other regions that require specific legal bases under GDPR or similar regimes.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>14. Third-Party Services Within the App</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          The App may use the following categories of third-party service providers, each of which has its own privacy practices:
          {"\n"}- Mobile platform providers (Apple for iOS, Google for Android) for App distribution, in-app purchases (if any), and push notifications;
          {"\n"}- Analytics and crash-reporting providers to help us improve the App;
          {"\n"}- Customer support and email providers to respond to your inquiries;
          {"\n"}- Attribution providers to measure the effectiveness of our own advertising (aggregated, non-personal).
        </Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          These providers may collect limited device-level information as described in their respective privacy policies. We select providers that support privacy-respecting configurations and do not authorize them to use information beyond what is necessary to provide services to us.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>15. Changes to This Policy</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, provide notice within the App. Your continued use of the App after an update constitutes acceptance of the revised Privacy Policy.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>16. How to Contact Us</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          CuraDebt Systems, LLC{"\n"}
          Attn: Privacy Officer - DebtPath{"\n"}
          4000 Hollywood Blvd, Suite 555-S{"\n"}
          Hollywood, FL 33021{"\n"}
          United States{"\n\n"}
          Email: management@curadebt.com{"\n"}
          Phone: 1-877-850-3328 x888
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: Fonts.semiBold, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 16 },
  updated: { fontSize: 13, marginBottom: 16 },
  heading: { fontSize: 16, fontFamily: Fonts.bold, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  subheading: { fontSize: 15, fontFamily: Fonts.semiBold, fontWeight: "600", marginTop: 14, marginBottom: 6 },
  paragraph: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  bold: { fontFamily: Fonts.semiBold, fontWeight: "600" },
});
