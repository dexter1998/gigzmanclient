import { calculateEmi } from "@/lib/calculators/emi";
import { formatInr, formatIndianPrice } from "@/lib/format";
import type { LoanAmount } from "./amounts";
import { rateFor, type Lender } from "./banks";
import type { LoanFaq } from "@/components/realestate/premium-v2/home-loan/LoanFaqV2";

/**
 * Question wording follows the phrasings actually observed in the FAQ blocks
 * of the pages that rank for these queries (HDFC, NoBroker, Urban Money) —
 * that corpus is what Google draws "People also ask" from. The answers are
 * computed from the loan figures rather than templated, so they differ
 * genuinely across the ladder instead of restating one sentence.
 */
export function amountFaqs(amount: LoanAmount, lender?: Lender): LoanFaq[] {
  const { rate, isLenderPublished } = rateFor(lender);
  const who = lender ? `${lender.name} ` : "";

  const emi20 = calculateEmi({ principal: amount.value, annualRatePercent: rate, tenureYears: 20 });
  const emi25 = calculateEmi({ principal: amount.value, annualRatePercent: rate, tenureYears: 25 });
  const emi30 = calculateEmi({ principal: amount.value, annualRatePercent: rate, tenureYears: 30 });
  const income = Math.round(emi20.monthlyEmi / 0.5 / 1000) * 1000;

  const rateNote = isLenderPublished
    ? `${lender?.name}'s published starting rate of ${rate}% p.a.`
    : `an indicative ${rate}% p.a.`;

  return [
    {
      question: `What will be the EMI for a ${amount.label} ${who}home loan?`,
      answer: `At ${rateNote} over 20 years, the EMI works out to about ${formatInr(Math.round(emi20.monthlyEmi))} a month. Over 25 years it falls to roughly ${formatInr(Math.round(emi25.monthlyEmi))}, and over 30 years to about ${formatInr(Math.round(emi30.monthlyEmi))}. Your sanctioned rate depends on your credit profile, so treat these as a planning estimate rather than a quote.`,
    },
    {
      question: `What salary is required for a ${amount.label} home loan?`,
      answer: `Most lenders keep total EMIs at or below about half of net monthly income, which puts the indicative requirement for ${amount.label} over 20 years at roughly ${formatInr(income)} a month. Existing EMIs and credit-card dues reduce that headroom, and a co-applicant's income can be added to meet it.`,
    },
    {
      question: `What is the maximum tenure available on a ${amount.label} home loan?`,
      answer: lender?.maxTenureYears
        ? `${lender.name} offers up to ${lender.maxTenureYears} years. The practical limit is also age-linked — the loan usually has to close by 60 for salaried and 65 for self-employed borrowers, so a longer tenure is only available if your age allows it.`
        : `Most lenders go up to 30 years, with a few offering more. The practical limit is age-linked as well: the loan generally has to close by 60 for salaried and 65 for self-employed borrowers.`,
    },
    {
      question: `How much extra interest does a longer tenure cost on ${amount.label}?`,
      answer: `Stretching from 20 to 30 years lowers the monthly EMI by about ${formatInr(Math.round(emi20.monthlyEmi - emi30.monthlyEmi))}, but total interest rises from roughly ${formatIndianPrice(emi20.totalInterest)} to ${formatIndianPrice(emi30.totalInterest)} — an extra ${formatIndianPrice(emi30.totalInterest - emi20.totalInterest)} over the life of the loan. A longer tenure buys monthly breathing room at a real long-term cost.`,
    },
    {
      question: `Can I prepay a ${amount.label} home loan before the tenure ends?`,
      answer: `Yes. On floating-rate home loans to individuals, the RBI does not permit foreclosure or prepayment charges, so you can part-prepay or close early without a penalty. Fixed-rate loans can carry a charge — check that before choosing a fixed option. Prepaying in the first few years saves far more than prepaying later, because early instalments are mostly interest.`,
    },
    {
      question: `Can I get a ${amount.label} home loan with a low credit score?`,
      answer: `Below about 700 a sanction becomes harder and usually comes at a higher rate; between 700 and 750 most lenders will still lend at a premium; above 750 you get the best pricing. If your score is weak, adding a co-applicant, increasing the down payment or clearing existing dues before applying all help materially.`,
    },
    {
      question: `What down payment do I need alongside a ${amount.label} loan?`,
      answer: `Lenders typically fund up to 80% of the agreement value, so ${amount.label} supports a purchase of roughly ${formatIndianPrice(amount.value / 0.8)} with about ${formatIndianPrice(amount.value / 0.8 - amount.value)} coming from you. Budget separately for stamp duty, registration and interiors — those are not part of the loan.`,
    },
  ];
}

export function bankFaqs(lender: Lender): LoanFaq[] {
  const faqs: LoanFaq[] = [
    {
      question: `What is the interest rate on a ${lender.name} home loan?`,
      answer: lender.rateFrom
        ? `${lender.name} publishes a starting rate of ${lender.rateFrom}% p.a. (read from their own site on ${lender.ratesAsOf}). That is a floor for the strongest credit profiles — your actual rate depends on credit score, income type and loan size, and rates move with the RBI repo rate. We confirm the live figure when your file goes in.`
        : `${lender.name} does not publish a single headline rate we can quote reliably, so we confirm the current figure directly with them when your application is prepared rather than printing a number that may be stale. Rates in this segment move with the RBI repo rate and vary by credit score.`,
    },
    {
      question: `What is the processing fee for a ${lender.name} home loan?`,
      answer: lender.processingFee
        ? `${lender.processingFee}. Fees change and are sometimes waived during promotional periods, so confirm the applicable amount before you pay it.`
        : `${lender.name} does not publish a typical processing fee we can quote, so we confirm it in writing with them before you commit. Ask for it as a rupee figure rather than a percentage cap.`,
    },
    {
      question: `What is the maximum tenure on a ${lender.name} home loan?`,
      answer: lender.maxTenureYears
        ? `Up to ${lender.maxTenureYears} years, subject to your age at maturity — the loan generally has to close by 60 for salaried and 65 for self-employed applicants.`
        : `Tenure is confirmed at sanction and is limited by your age at maturity, typically closing by 60 for salaried and 65 for self-employed applicants.`,
    },
    {
      question: `Can High Properties help with a ${lender.name} home loan application?`,
      answer: `Yes. We are an authorised channel partner and handle eligibility assessment, document preparation and coordination with ${lender.name} through to disbursement. We can also run your file with more than one lender in parallel so you are not waiting on a single decision. We do not sanction the loan — that decision is ${lender.name}'s.`,
    },
    {
      question: `Can I transfer an existing home loan to ${lender.name}?`,
      answer: `Yes, a balance transfer is possible once you have a clean repayment record, usually of at least 12 months. It is worth doing when the rate saving outweighs the new lender's processing and legal costs — we run that comparison for you before recommending a move, because a small rate difference often does not justify the switch.`,
    },
    {
      question: `What documents does ${lender.name} need for a home loan in Gurugram?`,
      answer: `PAN and Aadhaar, income proof (three months' salary slips and six months' bank statements for salaried; three years' ITR with audited financials for self-employed), and the property papers — builder buyer agreement or sale deed, approved plan and RERA registration. For Gurugram resale purchases the chain of title is usually the item that holds a file up, so we check it early.`,
    },
  ];

  return faqs;
}
