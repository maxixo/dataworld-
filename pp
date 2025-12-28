<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>DataWorld - Modern Data Analytics Platform</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2563EB", 
                        "primary-hover": "#1d4ed8",
                        "accent-teal": "#06B6D4",
                        "surface-light": "#ffffff",
                        "background-light": "#F9FAFB",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "Inter", "sans-serif"],
                        "body": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "xl": "0.75rem",
                        "2xl": "1rem",
                    }
                },
            },
        }
    </script>
<style>
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .hero-gradient {
            background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%);
        }
    </style>
</head>
<body class="bg-surface-light font-body text-slate-900 overflow-x-hidden antialiased selection:bg-primary/20 selection:text-primary">
<nav class="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
<div class="flex items-center gap-8">
<a class="flex items-center gap-2 group" href="#">
<div class="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
<span class="material-symbols-outlined text-[20px]">ssid_chart</span>
</div>
<span class="font-display text-xl font-bold tracking-tight text-slate-900">DataWorld</span>
</a>
<div class="hidden md:flex gap-6">
<a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="#features">Features</a>
<a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="#solutions">Solutions</a>
<a class="text-sm font-medium text-slate-600 hover:text-primary transition-colors" href="#pricing">Pricing</a>
</div>
</div>
<div class="flex items-center gap-4">
<a class="hidden text-sm font-medium text-slate-600 hover:text-primary sm:block transition-colors" href="#">Log in</a>
<a class="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all hover:-translate-y-0.5" href="#">
                Get Started
            </a>
</div>
</div>
</nav>
<main class="relative pt-16">
<section class="relative overflow-hidden pt-16 lg:pt-24 hero-gradient">
<div class="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
<div class="flex items-center justify-center gap-2 mb-6 animate-fade-in-up">
<span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">New Feature</span>
<span class="text-sm font-medium text-slate-600">AI-powered predictive modeling is here ›</span>
</div>
<h1 class="mx-auto max-w-4xl font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6 leading-[1.15]">
                Unlock actionable insights<br/>
<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-teal">from your raw data</span>
</h1>
<p class="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
                DataWorld transforms complex datasets into beautiful, interactive dashboards in seconds. Connect your sources, visualize trends, and share powerful reports with your team.
            </p>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
<a class="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 hover:-translate-y-1" href="#">
                    Start Building for Free
                </a>
<a class="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-slate-200 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200" href="#">
<span class="material-symbols-outlined mr-2 text-[20px]">play_circle</span>
                    View Demo
                </a>
</div>
<div class="relative mx-auto max-w-[1100px] perspective-1000">
<div class="relative rounded-xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 backdrop-blur-xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
<div class="flex h-10 items-center border-b border-slate-100 bg-slate-50/50 px-4 gap-2">
<div class="flex gap-1.5">
<div class="size-3 rounded-full bg-red-400/80"></div>
<div class="size-3 rounded-full bg-amber-400/80"></div>
<div class="size-3 rounded-full bg-emerald-400/80"></div>
</div>
<div class="ml-4 flex h-6 flex-1 max-w-md items-center rounded-md bg-white border border-slate-200 px-3 text-xs text-slate-400 font-medium font-mono">
                            dataworld.app/dashboard/analytics
                        </div>
</div>
<div class="flex h-[550px] bg-[#F8FAFC]">
<div class="hidden md:flex w-64 flex-col border-r border-slate-100 bg-white p-4">
<div class="space-y-1">
<div class="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-primary font-semibold text-sm">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
                                    Dashboard
                                </div>
<div class="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
<span class="material-symbols-outlined text-[20px]">folder_open</span>
                                    Datasets
                                </div>
<div class="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
<span class="material-symbols-outlined text-[20px]">pie_chart</span>
                                    Reports
                                </div>
<div class="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">
<span class="material-symbols-outlined text-[20px]">group</span>
                                    Team
                                </div>
</div>
<div class="mt-8">
<h3 class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Recent Uploads</h3>
<div class="mt-3 space-y-3 px-3">
<div class="flex items-center gap-2">
<span class="size-2 rounded-full bg-emerald-400"></span>
<span class="text-sm text-slate-600">Q3_Revenue.csv</span>
</div>
<div class="flex items-center gap-2">
<span class="size-2 rounded-full bg-blue-400"></span>
<span class="text-sm text-slate-600">User_Growth.json</span>
</div>
</div>
</div>
</div>
<div class="flex-1 p-6 lg:p-8 overflow-hidden">
<div class="flex items-center justify-between mb-8">
<div>
<h2 class="text-2xl font-bold text-slate-900">Weekly Overview</h2>
<p class="text-sm text-slate-500">Last updated: Just now</p>
</div>
<div class="flex gap-2">
<button class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
<span class="material-symbols-outlined text-[18px]">cloud_upload</span>
                                        Import
                                    </button>
<button class="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover">
                                        Export Report
                                    </button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
<div class="flex items-start justify-between">
<div>
<p class="text-sm font-medium text-slate-500">Total Users</p>
<h3 class="text-2xl font-bold text-slate-900 mt-1">24,592</h3>
</div>
<span class="flex size-8 items-center justify-center rounded-full bg-blue-50 text-primary">
<span class="material-symbols-outlined text-[18px]">group</span>
</span>
</div>
<div class="mt-4 h-16 w-full">
<svg class="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
<path d="M0 35 C20 35, 30 10, 50 20 S 80 5, 100 15" fill="none" stroke="#2563EB" stroke-width="2"></path>
<path d="M0 35 C20 35, 30 10, 50 20 S 80 5, 100 15 V 40 H 0 Z" fill="url(#grad1)" opacity="0.1"></path>
<defs>
<linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style="stop-color:#2563EB;stop-opacity:1"></stop>
<stop offset="100%" style="stop-color:#2563EB;stop-opacity:0"></stop>
</linearGradient>
</defs>
</svg>
</div>
</div>
<div class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
<div class="flex items-start justify-between">
<div>
<p class="text-sm font-medium text-slate-500">Revenue</p>
<h3 class="text-2xl font-bold text-slate-900 mt-1">$84,300</h3>
</div>
<span class="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
<span class="material-symbols-outlined text-[18px]">payments</span>
</span>
</div>
<div class="mt-4 flex items-end gap-1 h-16 justify-between px-1">
<div class="w-full bg-emerald-100 rounded-t-sm h-[40%]"></div>
<div class="w-full bg-emerald-200 rounded-t-sm h-[70%]"></div>
<div class="w-full bg-emerald-400 rounded-t-sm h-[50%]"></div>
<div class="w-full bg-emerald-500 rounded-t-sm h-[90%]"></div>
<div class="w-full bg-emerald-300 rounded-t-sm h-[60%]"></div>
</div>
</div>
<div class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
<div class="flex items-start justify-between">
<div>
<p class="text-sm font-medium text-slate-500">Active Sessions</p>
<h3 class="text-2xl font-bold text-slate-900 mt-1">1,204</h3>
</div>
<span class="flex size-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
<span class="material-symbols-outlined text-[18px]">bolt</span>
</span>
</div>
<div class="mt-4 h-16 flex items-center justify-center">
<div class="text-xs text-slate-400">Live data stream active...</div>
</div>
</div>
</div>
<div class="mt-6 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
<div class="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
<h3 class="font-semibold text-slate-900">Recent Transactions</h3>
<button class="text-xs font-medium text-primary">View All</button>
</div>
<div class="p-0">
<div class="flex items-center justify-between border-b border-slate-50 px-6 py-3 hover:bg-slate-50 transition-colors">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined text-sm">description</span>
</div>
<span class="text-sm font-medium text-slate-700">Invoice #00124</span>
</div>
<span class="text-sm font-bold text-slate-900">$1,200.00</span>
</div>
<div class="flex items-center justify-between border-b border-slate-50 px-6 py-3 hover:bg-slate-50 transition-colors">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined text-sm">description</span>
</div>
<span class="text-sm font-medium text-slate-700">Invoice #00125</span>
</div>
<span class="text-sm font-bold text-slate-900">$2,450.00</span>
</div>
<div class="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
<span class="material-symbols-outlined text-sm">description</span>
</div>
<span class="text-sm font-medium text-slate-700">Invoice #00126</span>
</div>
<span class="text-sm font-bold text-slate-900">$850.00</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<section class="bg-white py-24 sm:py-32" id="features">
<div class="mx-auto max-w-7xl px-6 lg:px-8">
<div class="mx-auto max-w-2xl text-center">
<h2 class="text-base font-semibold leading-7 text-primary">Deploy faster</h2>
<p class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-display">Everything you need to master your data</p>
<p class="mt-6 text-lg leading-8 text-slate-600">
                    Stop wrestling with spreadsheets. DataWorld gives you the power of an enterprise data team in a simple, intuitive interface.
                </p>
</div>
<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
<dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
<div class="flex flex-col">
<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
<span class="material-symbols-outlined text-white">query_stats</span>
</div>
                                Advanced Analytics
                            </dt>
<dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
<p class="flex-auto">Run complex queries with a simple drag-and-drop interface. No SQL knowledge required to find the answers you need.</p>
</dd>
</div>
<div class="flex flex-col">
<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-teal">
<span class="material-symbols-outlined text-white">sync</span>
</div>
                                Real-time Sync
                            </dt>
<dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
<p class="flex-auto">Connect to Google Sheets, Excel, or your database. Your dashboards update automatically as your data changes.</p>
</dd>
</div>
<div class="flex flex-col">
<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
<span class="material-symbols-outlined text-white">lock_open</span>
</div>
                                Secure Sharing
                            </dt>
<dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
<p class="flex-auto">Share reports with a link or embed them in your own tools. Granular permissions keep your sensitive data safe.</p>
</dd>
</div>
</dl>
</div>
</div>
</section>
<section class="border-y border-slate-100 bg-slate-50 py-16">
<div class="mx-auto max-w-7xl px-6 lg:px-8">
<h2 class="text-center text-sm font-semibold leading-8 text-slate-500">TRUSTED BY INNOVATIVE TEAMS AT</h2>
<div class="mx-auto mt-8 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
<div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 grayscale opacity-50 font-bold text-xl text-slate-400 flex justify-center">Acme Corp</div>
<div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 grayscale opacity-50 font-bold text-xl text-slate-400 flex justify-center">GlobalBank</div>
<div class="col-span-2 max-h-12 w-full object-contain lg:col-span-1 grayscale opacity-50 font-bold text-xl text-slate-400 flex justify-center">NextGen</div>
<div class="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 grayscale opacity-50 font-bold text-xl text-slate-400 flex justify-center">Stark Ind</div>
<div class="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 grayscale opacity-50 font-bold text-xl text-slate-400 flex justify-center">Umbrella</div>
</div>
</div>
</section>
<section class="relative isolate overflow-hidden bg-slate-900 py-16 sm:py-24 lg:py-32">
<div class="mx-auto max-w-7xl px-6 lg:px-8">
<div class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
<div class="max-w-xl lg:max-w-lg">
<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">Ready to visualize your success?</h2>
<p class="mt-4 text-lg leading-8 text-slate-300">Join thousands of data analysts and business leaders who use DataWorld to make better decisions, faster.</p>
<div class="mt-6 flex max-w-md gap-x-4">
<label class="sr-only" for="email-address">Email address</label>
<input autocomplete="email" class="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6" id="email-address" name="email" placeholder="Enter your email" required="" type="email"/>
<button class="flex-none rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all" type="submit">Get Started</button>
</div>
</div>
<dl class="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
<div class="flex flex-col items-start">
<div class="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
<span class="material-symbols-outlined text-white">calendar_month</span>
</div>
<dt class="mt-4 font-semibold text-white">14-day free trial</dt>
<dd class="mt-2 leading-7 text-slate-400">Experience the full power of the platform with no commitment.</dd>
</div>
<div class="flex flex-col items-start">
<div class="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
<span class="material-symbols-outlined text-white">credit_card_off</span>
</div>
<dt class="mt-4 font-semibold text-white">No credit card required</dt>
<dd class="mt-2 leading-7 text-slate-400">Sign up and start visualizing your data in under 2 minutes.</dd>
</div>
</dl>
</div>
</div>
<div aria-hidden="true" class="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
<div class="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#06B6D4] to-[#2563EB] opacity-30" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
</div>
</section>
</main>
<footer class="bg-white">
<div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
<nav aria-label="Footer" class="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12">
<div class="pb-6">
<a class="text-sm leading-6 text-slate-600 hover:text-primary transition-colors" href="#">About</a>
</div>
<div class="pb-6">
<a class="text-sm leading-6 text-slate-600 hover:text-primary transition-colors" href="#">Blog</a>
</div>
<div class="pb-6">
<a class="text-sm leading-6 text-slate-600 hover:text-primary transition-colors" href="#">Jobs</a>
</div>
<div class="pb-6">
<a class="text-sm leading-6 text-slate-600 hover:text-primary transition-colors" href="#">Press</a>
</div>
<div class="pb-6">
<a class="text-sm leading-6 text-slate-600 hover:text-primary transition-colors" href="#">Privacy</a>
</div>
<div class="pb-6">
<a class="text-sm leading-6 text-slate-600 hover:text-primary transition-colors" href="#">Terms</a>
</div>
</nav>
<div class="mt-10 flex justify-center space-x-10">
<a class="text-slate-400 hover:text-slate-500" href="#">
<span class="sr-only">GitHub</span>
<svg aria-hidden="true" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
<path clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill-rule="evenodd"></path>
</svg>
</a>
<a class="text-slate-400 hover:text-slate-500" href="#">
<span class="sr-only">Twitter</span>
<svg aria-hidden="true" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
</svg>
</a>
</div>
<p class="mt-10 text-center text-xs leading-5 text-slate-500">© 2024 DataWorld Inc. All rights reserved.</p>
</div>
</footer>

</body></html>