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

export default function TermsScreen() {
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
        <Text style={[styles.headerTitle, { color: C.text }]}>Terms of Service</Text>
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
          Please Read Carefully. These Terms of Service contain important provisions regarding eligibility, the educational nature of the App, disclaimers of financial, legal, and tax advice, limitations on our liability, a binding arbitration agreement, and a class-action waiver. By downloading or using DebtPath, you agree to these Terms.
        </Text>
        <Text style={[styles.heading, { color: C.text }]}>Table of Contents</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          1. Acceptance of Terms{"\n"}2. Eligibility{"\n"}3. License Grant{"\n"}4. Educational Purpose - No Financial, Legal, or Tax Advice{"\n"}5. Accuracy of Information You Enter{"\n"}6. No Guarantee of Results{"\n"}7. Third-Party Services, Referrals, and Links{"\n"}8. Prohibited Uses{"\n"}9. Intellectual Property{"\n"}10. Your Content{"\n"}11. Privacy{"\n"}12. In-App Purchases and Subscriptions{"\n"}13. Disclaimers of Warranty{"\n"}14. Limitation of Liability{"\n"}15. Indemnification{"\n"}16. Binding Arbitration and Class Action Waiver{"\n"}17. Governing Law and Venue{"\n"}18. Apple-Specific Terms{"\n"}19. Google Play-Specific Terms{"\n"}20. Termination{"\n"}21. Modifications{"\n"}22. Miscellaneous{"\n"}23. Contact
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>These Terms of Service (the "Terms") form a binding agreement between you and CuraDebt Systems, LLC, a Florida limited liability company ("CuraDebt," "we," "us," or "our"), governing your use of the DebtPath mobile application (the "App"). By downloading, installing, accessing, or using the App, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the App.</Text>

        <Text style={[styles.heading, { color: C.text }]}>2. Eligibility</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>You must be at least 18 years old and able to form a legally binding contract under applicable law to use the App. By using the App, you represent and warrant that you meet these requirements. The App is intended for personal, non-commercial use by residents of the United States.</Text>

        <Text style={[styles.heading, { color: C.text }]}>3. License Grant</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Subject to your compliance with these Terms, CuraDebt grants you a limited, personal, non-exclusive, non-transferable, non-sublicensable, revocable license to download, install, and use the App on a mobile device that you own or control, solely for your personal, non-commercial use. All rights not expressly granted are reserved by CuraDebt and its licensors.</Text>

        <Text style={[styles.heading, { color: C.text }]}>4. Educational Purpose - No Financial, Legal, or Tax Advice</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>DebtPath is an educational and motivational tool only. The content, calculators, recommendations, and features provided by the App are for general informational purposes. CuraDebt is not acting as your financial advisor, credit counselor, accountant, attorney, debt settlement company, lender, or loan broker when you use the App.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Nothing in the App constitutes financial advice, legal advice, tax advice, credit counseling, debt management services, or any other regulated professional advice. Before making any decision about your debts, credit, taxes, bankruptcy, or other financial matters, you should consult a qualified, licensed professional in your jurisdiction.</Text>

        <Text style={[styles.heading, { color: C.text }]}>5. Accuracy of Information You Enter</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>The App's outputs, projections, and recommendations are based on the information you enter. Inaccurate, incomplete, or hypothetical inputs will produce inaccurate outputs. You are solely responsible for the accuracy of all information you enter. The App is not connected to your creditors or financial accounts and has no way to verify the accuracy of what you provide.</Text>

        <Text style={[styles.heading, { color: C.text }]}>6. No Guarantee of Results</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Debt payoff outcomes depend on many factors outside of our control, including your income, spending, interest rates, creditor policies, market conditions, and your personal discipline in following a plan. We do not guarantee that using the App will reduce your debt, save you money, improve your credit, prevent collections or lawsuits, or produce any particular financial result. Past examples, projections, or illustrative scenarios are not promises of future performance.</Text>

        <Text style={[styles.heading, { color: C.text }]}>7. Third-Party Services, Referrals, and Links</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>The App may contain links, offers, or referrals to websites, applications, or services operated by third parties, including companies that provide debt consolidation, credit counseling, tax relief, bankruptcy, or related services. CuraDebt is not responsible for any third-party product, service, website, application, content, advertising, or practice.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>You may be referred through the App to CuraDebt's own debt-relief matching service or to unaffiliated third-party service providers. In either case, the terms of service and privacy policy of the receiving service will govern your engagement with that service, and any transaction, disclosure, or submission of information is between you and that service.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>If you choose to tap through to any third-party or affiliated service, you are leaving DebtPath. Once on the receiving service's property, that service's terms of service and privacy policy apply. CuraDebt makes no representation or warranty regarding any third party and disclaims all liability arising from your interaction with any third party.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>CuraDebt may receive a referral fee, advertising compensation, or other consideration when a user taps through to a third-party offer or engages with an affiliated service. These referral relationships do not change your price, but they do create a financial incentive for us to present certain categories of offers. You should independently evaluate any service before engaging with it.</Text>

        <Text style={[styles.heading, { color: C.text }]}>8. Prohibited Uses</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>
          You agree not to:
          {"\n"}- Use the App for any unlawful purpose or in violation of these Terms or applicable law;
          {"\n"}- Reverse engineer, decompile, disassemble, or attempt to derive the source code of the App, except as permitted by law;
          {"\n"}- Modify, adapt, translate, or create derivative works based on the App;
          {"\n"}- Remove, alter, or obscure any proprietary notices within the App;
          {"\n"}- Use the App to harass, defraud, or harm others;
          {"\n"}- Use automated means, bots, scrapers, or similar tools to access or interact with the App;
          {"\n"}- Interfere with or disrupt the App, its servers, or any networks connected to the App;
          {"\n"}- Resell, sublicense, rent, lease, or commercially exploit the App or any of its content;
          {"\n"}- Use the App to provide services to any third party without our prior written consent.
        </Text>

        <Text style={[styles.heading, { color: C.text }]}>9. Intellectual Property</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>The App, including all software, content, graphics, text, user interfaces, visual design, characters and mascots (including "Dex"), trademarks, logos, and the overall "look and feel," is owned by CuraDebt or its licensors and is protected by U.S. and international intellectual property laws. "CuraDebt(R)" is a registered trademark of CuraDebt Systems, LLC. "DebtPath" and "Dex," together with associated logos and marks, are trademarks of CuraDebt Systems, LLC. You receive no ownership rights in the App or in any CuraDebt intellectual property by virtue of downloading or using the App.</Text>

        <Text style={[styles.heading, { color: C.text }]}>10. Your Content</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>You retain ownership of any information or content you enter into the App ("Your Content"). Because Your Content is stored locally on your device by default, CuraDebt does not ordinarily receive or store it. To the extent Your Content is ever transmitted to us (for example, if you email us a screenshot or enable a future optional cloud feature), you grant CuraDebt a limited, worldwide, royalty-free license to process that content for the sole purpose of providing the App and responding to your request. You represent that you have the right to submit any content you submit and that it does not violate any third-party rights.</Text>

        <Text style={[styles.heading, { color: C.text }]}>11. Privacy</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Our handling of information is described in the DebtPath Privacy Policy, which is incorporated into these Terms by reference. Please review it carefully.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Your use of the App is also subject to the disclosures presented in the App Store listing, including the App Privacy details made available in App Store Connect. In the event of any conflict between those disclosures and these Terms or the Privacy Policy, CuraDebt may update these Terms or the Privacy Policy to reflect the App's actual data practices and App Store disclosure requirements.</Text>

        <Text style={[styles.heading, { color: C.text }]}>12. In-App Purchases and Subscriptions</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>If the App offers optional in-app purchases or subscriptions, they are processed by the applicable app store (Apple's App Store for iOS devices or Google Play for Android devices) under that store's standard terms. Prices, billing intervals, and automatic renewals will be disclosed at the point of purchase. To cancel a subscription, use the subscription management controls in your Apple ID account or your Google Play account, as applicable. Refund requests for App Store or Google Play purchases must generally be directed to Apple or Google, respectively, in accordance with their refund policies.</Text>

        <Text style={[styles.heading, { color: C.text }]}>13. Disclaimers of Warranty</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CURADEBT AND ITS AFFILIATES, LICENSORS, AND SERVICE PROVIDERS DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, RELIABILITY, AND QUIET ENJOYMENT.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, SECURE, OR FREE OF ERRORS OR VIRUSES, OR THAT ANY CALCULATION, PROJECTION, OR RECOMMENDATION WILL BE ACCURATE OR APPROPRIATE FOR YOUR CIRCUMSTANCES. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU.</Text>

        <Text style={[styles.heading, { color: C.text }]}>14. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL CURADEBT, ITS AFFILIATES, OFFICERS, DIRECTORS, MEMBERS, EMPLOYEES, AGENTS, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE THE APP, ANY CONTENT IN THE APP, ANY THIRD-PARTY SERVICE, OR THESE TERMS, EVEN IF CURADEBT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>IN NO EVENT WILL THE AGGREGATE LIABILITY OF CURADEBT AND ITS AFFILIATES ARISING OUT OF OR RELATING TO THE APP OR THESE TERMS EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU PAID TO CURADEBT FOR THE APP IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (US$100).</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>THE LIMITATIONS IN THIS SECTION APPLY REGARDLESS OF THE LEGAL THEORY ON WHICH ANY CLAIM IS BASED (CONTRACT, TORT, STATUTE, OR OTHERWISE) AND ARE A FUNDAMENTAL PART OF THE BASIS OF THE BARGAIN BETWEEN YOU AND CURADEBT. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</Text>

        <Text style={[styles.heading, { color: C.text }]}>15. Indemnification</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>To the fullest extent permitted by law, you agree to defend, indemnify, and hold harmless CuraDebt and its affiliates, officers, directors, members, employees, agents, licensors, and service providers from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use or misuse of the App; (b) your violation of these Terms; (c) your violation of any applicable law or the rights of any third party; (d) any information or content you submit; or (e) your engagement with any third-party service you access through the App.</Text>

        <Text style={[styles.heading, { color: C.text }]}>16. Binding Arbitration and Class Action Waiver</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.1 Agreement to Arbitrate. You and CuraDebt agree that any dispute, claim, or controversy arising out of or relating to these Terms or the App (a "Dispute") will be resolved exclusively by final and binding arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules, rather than in court, except as set forth below.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.2 Informal Resolution First. Before initiating arbitration, you agree to first contact us at management@curadebt.com and attempt in good faith to resolve the Dispute informally for at least 60 days.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.3 Arbitration Procedure. The arbitration will be conducted by a single arbitrator. The arbitration will take place in Broward County, Florida, or, at your election, in the U.S. county where you reside, or by telephone or video conference. The arbitrator's award will be final and binding and may be entered as a judgment in any court of competent jurisdiction.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.4 Class Action Waiver. YOU AND CURADEBT AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING. THE ARBITRATOR MAY NOT CONSOLIDATE THE CLAIMS OF MULTIPLE PARTIES AND MAY NOT PRESIDE OVER ANY FORM OF REPRESENTATIVE OR CLASS PROCEEDING.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.5 Exceptions. Either party may bring an individual action in small-claims court for Disputes within that court's jurisdiction. Either party may also seek injunctive or equitable relief in a court of competent jurisdiction to protect intellectual property rights.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.6 Opt-Out. You may opt out of this arbitration agreement by sending written notice to management@curadebt.com within 30 days after first accepting these Terms. Your notice must include your full name, address, and a clear statement that you wish to opt out. Opting out will not affect any other provision of these Terms.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>16.7 Severability. If the class action waiver in Section 16.4 is found unenforceable as to a particular claim, then that claim will be severed from the arbitration and brought in court, but the remaining arbitration agreement will continue to apply to all other claims.</Text>

        <Text style={[styles.heading, { color: C.text }]}>17. Governing Law and Venue</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>These Terms are governed by the laws of the State of Florida, without regard to its conflict-of-laws rules. The Federal Arbitration Act governs the interpretation and enforcement of Section 16. Subject to Section 16, any action not subject to arbitration will be brought exclusively in the state or federal courts located in Broward County, Florida, and you consent to personal jurisdiction and venue in those courts.</Text>
        <Text style={[styles.heading, { color: C.text }]}>18. Apple-Specific Terms</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>The following additional terms apply to you if you download the App from the Apple App Store.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Acknowledgment. These Terms are between you and CuraDebt only, and not with Apple Inc. ("Apple"). CuraDebt, not Apple, is solely responsible for the App and its content.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Scope of License. The license granted to you for the App is limited to a non-transferable license to use the App on any Apple-branded device that you own or control and as permitted by the Usage Rules set forth in the Apple Media Services Terms and Conditions.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Maintenance and Support. CuraDebt is solely responsible for providing any maintenance and support services for the App. Apple has no obligation to furnish any maintenance or support services.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Warranty. CuraDebt is solely responsible for any product warranties, whether express or implied by law, to the extent not effectively disclaimed. In the event of any failure of the App to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price (if any) for the App. To the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Product Claims. CuraDebt, not Apple, is responsible for addressing any claims by you or any third party relating to the App, including but not limited to product liability claims, compliance claims, and consumer protection/privacy/similar legislation claims.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Intellectual Property Rights. In the event of any third-party claim that the App or your use of the App infringes that third party's intellectual property rights, CuraDebt, not Apple, will be solely responsible for the investigation, defense, settlement, and discharge of any such claim.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Legal Compliance. You represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo or designated as a terrorist-supporting country, and (ii) you are not listed on any U.S. Government list of prohibited or restricted parties.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Developer Contact Information. For any questions, complaints, or claims with respect to the App, please contact CuraDebt at the address set forth in Section 23 below.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Third-Party Terms of Agreement. You must comply with applicable third-party terms of agreement when using the App.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Third-Party Beneficiary. You acknowledge and agree that Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce these Terms against you as a third-party beneficiary.</Text>
        <Text style={[styles.heading, { color: C.text }]}>19. Google Play-Specific Terms</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>The following additional terms apply to you if you download the App from the Google Play Store: these Terms are between you and CuraDebt (not Google), and CuraDebt is responsible for the App's content, maintenance/support, warranty and claims handling, intellectual property claim response, and developer contact. Your use is also subject to Google Play's terms and policies.</Text>

        <Text style={[styles.heading, { color: C.text }]}>20. Termination</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>You may stop using the App at any time and delete it from your device. We may suspend or terminate your access to the App at any time, with or without notice, for any reason, including if we believe you have violated these Terms. Sections that by their nature should survive termination will survive.</Text>

        <Text style={[styles.heading, { color: C.text }]}>21. Modifications</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>We may update these Terms from time to time. When we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, provide notice within the App. Your continued use of the App after an update constitutes acceptance of the revised Terms. If you do not agree, you must stop using the App.</Text>

        <Text style={[styles.heading, { color: C.text }]}>22. Miscellaneous</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Entire Agreement. These Terms, together with the Privacy Policy and any additional terms presented at the point of any in-app purchase, constitute the entire agreement between you and CuraDebt regarding the App and supersede all prior agreements on the subject.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Severability. If any provision of these Terms is found unenforceable, the remaining provisions will continue in full force and effect.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>No Waiver. Our failure to enforce any right or provision of these Terms will not be deemed a waiver of that right or provision.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Assignment. You may not assign or transfer these Terms or any of your rights under them without our prior written consent. CuraDebt may freely assign these Terms in connection with a merger, acquisition, reorganization, or sale of assets.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Force Majeure. CuraDebt will not be liable for any delay or failure to perform resulting from causes outside its reasonable control.</Text>
        <Text style={[styles.paragraph, { color: C.text }]}>Notices. We may provide notices to you through the App or to the email address you provide us. You may provide notices to CuraDebt at the address in Section 23.</Text>

        <Text style={[styles.heading, { color: C.text }]}>23. Contact</Text>
        <Text style={[styles.paragraph, { color: C.textSecondary, marginTop: 4 }]}>CuraDebt Systems, LLC{"\n"}Attn: Legal - DebtPath{"\n"}4000 Hollywood Blvd, Suite 555-S{"\n"}Hollywood, FL 33021{"\n"}United States{"\n\n"}Email: management@curadebt.com{"\n"}Phone: 1-877-850-3328 x888</Text>
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
  paragraph: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  bold: { fontFamily: Fonts.semiBold, fontWeight: "600" },
});
