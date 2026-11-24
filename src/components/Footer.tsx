'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FacebookIcon, FrameIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react';

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

interface FooterProps {
	lang?: 'en' | 'hi';
}

export function Footer({ lang = 'en' }: FooterProps) {
	const isHi = lang === 'hi';
	const links = [
		{
			label: isHi ? 'प्लेटफ़ॉर्म' : 'Platform',
			links: [
				{ title: isHi ? 'नागरिक पोर्टल' : 'Citizen', href: '#citizen' },
				{ title: isHi ? 'सरकारी कमांड' : 'Governance & Oversight', href: '#govt' },
				{ title: isHi ? 'विश्वविद्यालय कार्यक्षेत्र' : 'Universities', href: '#university' },
				{ title: isHi ? '24-ज़िला मानचित्र' : 'District Insights', href: '#' },
			],
		},
		{
			label: isHi ? 'नवाचार पारिस्थितिकी तंत्र' : 'Ecosystem',
			links: [
				{ title: isHi ? 'परियोजना जीवनचक्र' : 'Lifecycle', href: '#' },
				{ title: isHi ? 'प्रभाव ब्लूप्रिंट' : 'Impact & Outcomes', href: '#' },
				{ title: isHi ? 'उद्योग एवं सीएसआर' : 'Industry & CSR', href: '#' },
			],
		},
		{
			label: isHi ? 'संसाधन' : 'Resources',
			links: [
				{ title: isHi ? 'बीआईटी मेसरा आरएंडडी' : 'BIT Mesra R&D', href: '#' },
				{ title: isHi ? 'आईआईटी आईएसएम धनबाद' : 'IIT ISM Dhanbad', href: '#' },
				{ title: isHi ? 'एनआईटी जमशेदपुर' : 'NIT Jamshedpur', href: '#' },
				{ title: isHi ? 'टाटा स्टील सीएसआर' : 'Tata Steel CSR', href: '#' },
			],
		},
		{
			label: isHi ? 'संपर्क एवं सहायता' : 'Governance',
			links: [
				{ title: isHi ? 'झारखंड उच्च शिक्षा परिषद' : 'JH Higher Education Council', href: '#' },
				{ title: isHi ? 'राज्य विज्ञान एवं प्रौद्योगिकी परिषद' : 'State Science & Tech Council', href: '#' },
				{ title: isHi ? 'गोपनीयता नीति' : 'Privacy Policy', href: '#' },
				{ title: isHi ? 'शर्तें एवं नियम' : 'Terms of Service', href: '#' },
			],
		},
	];

	return (
		<footer className="w-full bg-slate-900 border-t-2 border-orange-600 text-white mt-12 px-6 py-10">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
				<div className="md:col-span-2 space-y-3">
					<div className="flex items-center gap-2">
						<span className="bg-orange-600 text-white font-black text-sm px-2 py-0.5 rounded-sm uppercase tracking-wider">JH</span>
						<span className="font-bold text-lg tracking-tight text-white">{isHi ? 'झारखंड इनोवेशन हब' : 'JH Innovation Hub'}</span>
					</div>
					<p className="text-xs text-slate-400 leading-relaxed max-w-sm">
						{isHi
							? 'झारखंड सरकार द्वारा संचालित राज्य सामाजिक नवाचार पारिस्थितिकी तंत्र। नागरिक समस्याओं का तकनीकी अनुसंधान और सीएसआर के माध्यम से स्थायी समाधान।'
							: 'State Societal Innovation Ecosystem powered by Govt of Jharkhand. Connecting citizen challenges with university engineering R&D and industry CSR funding.'}
					</p>
					<div className="text-[11px] text-slate-500">
						© {new Date().getFullYear()} {isHi ? 'झारखंड सरकार • सर्वाधिकार सुरक्षित' : 'Government of Jharkhand • All Rights Reserved'}
					</div>
				</div>

				<div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-6">
					{links.map((sec) => (
						<div key={sec.label} className="space-y-2">
							<h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">{sec.label}</h4>
							<ul className="space-y-1.5 text-xs text-slate-300">
								{sec.links.map((lnk) => (
									<li key={lnk.title}>
										<span className="hover:text-white transition cursor-pointer">{lnk.title}</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</footer>
	);
}


type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
	key?: React.Key;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};
