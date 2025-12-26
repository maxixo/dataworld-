import mongoose from 'mongoose';
import { BlogPost } from '../models/BlogPost';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const samplePosts = [
    {
        title: "AI Agents Transform Enterprise Workflows in 2025",
        content: `The year 2025 marks a pivotal shift in how businesses operate, with AI agents becoming the cornerstone of enterprise automation. Unlike traditional software, these intelligent systems can understand context, make decisions, and execute complex multi-step workflows autonomously.

Major corporations report productivity gains of up to 40% after implementing AI agent systems. These agents handle everything from customer service inquiries to data analysis, freeing human workers to focus on creative and strategic tasks.

Key developments include:
- Multi-agent collaboration systems that work together to solve complex problems
- Natural language interfaces that make AI accessible to non-technical users
- Integration with existing enterprise software ecosystems
- Advanced reasoning capabilities that rival human decision-making

Industry experts predict that by the end of 2025, over 60% of Fortune 500 companies will have deployed AI agents in at least one critical business function. The technology is no longer experimental—it's becoming essential for competitive advantage.

The implications extend beyond efficiency. Companies are discovering that AI agents can identify patterns and opportunities that humans might miss, leading to innovation in product development, market strategy, and customer engagement.`,
        category: "Artificial Intelligence",
        tags: ["AI", "Enterprise", "Automation", "Productivity"],
        published: true
    },
    {
        title: "Quantum Computing Achieves Commercial Breakthrough",
        content: `In a landmark achievement, quantum computing has transitioned from research labs to commercial applications. IBM, Google, and several startups have announced quantum systems capable of solving real-world problems faster than classical supercomputers.

The breakthrough centers on error correction—the long-standing challenge that prevented quantum computers from maintaining stable calculations. New techniques allow quantum systems to run for hours instead of milliseconds, opening doors to practical applications.

Current commercial use cases include:
- Drug discovery and molecular simulation for pharmaceutical companies
- Financial modeling and risk assessment for investment firms
- Optimization of supply chains and logistics networks
- Climate modeling and weather prediction
- Cryptography and secure communications

A major pharmaceutical company recently used quantum computing to simulate protein folding, reducing drug development time from years to months. This single application could accelerate treatments for diseases affecting millions.

The quantum computing market is projected to reach $65 billion by 2030, with early adopters gaining significant competitive advantages. However, experts caution that quantum systems complement rather than replace classical computers—each excels at different types of problems.`,
        category: "Quantum Computing",
        tags: ["Quantum", "Innovation", "Technology", "Science"],
        published: true
    },
    {
        title: "The Rise of Ambient Computing: Technology Disappears Into Daily Life",
        content: `Ambient computing—technology that blends seamlessly into our environment—is reshaping how we interact with digital systems. Unlike smartphones that demand our attention, ambient computing works invisibly in the background, anticipating needs and responding to context.

Smart homes have evolved beyond voice assistants. Modern systems use sensors, AI, and predictive analytics to adjust lighting, temperature, and security automatically. Your home learns your routines and preferences, creating personalized environments without manual input.

Key trends in ambient computing:
- Gesture and gaze-based interfaces replacing touchscreens
- Spatial audio that creates immersive, location-aware soundscapes
- Wearable devices that monitor health continuously and unobtrusively
- Smart surfaces that turn any wall or table into an interactive display
- Context-aware AI that understands situations and responds appropriately

The technology extends beyond homes. Retail stores use ambient computing to personalize shopping experiences, offices optimize workspace based on occupancy patterns, and vehicles adjust settings based on driver preferences and road conditions.

Privacy remains a critical concern. As sensors and AI become ubiquitous, companies are developing new frameworks for data protection and user consent. The challenge is balancing convenience with privacy—a debate that will shape ambient computing's future.`,
        category: "Internet of Things",
        tags: ["IoT", "Smart Home", "UX", "Innovation"],
        published: true
    },
    {
        title: "Sustainable Tech: Green Data Centers Power the Cloud",
        content: `The tech industry's environmental impact is under scrutiny, and data centers—which consume 2% of global electricity—are leading the sustainability revolution. Major cloud providers have committed to carbon-neutral operations, driving innovation in green technology.

Modern data centers employ revolutionary cooling systems, renewable energy sources, and AI-optimized power management. Microsoft's underwater data center project demonstrated that submerged servers run cooler and more efficiently, while Google's AI reduces cooling energy by 40%.

Innovations transforming data center sustainability:
- Liquid cooling systems that eliminate energy-intensive air conditioning
- AI algorithms that predict and optimize power consumption in real-time
- Renewable energy integration with solar, wind, and hydroelectric power
- Heat recycling programs that warm nearby buildings and greenhouses
- Modular designs that reduce construction waste and improve efficiency

The shift isn't just environmental—it's economic. Energy costs represent a significant portion of data center expenses, making efficiency directly profitable. Companies investing in green infrastructure report both cost savings and improved public perception.

Emerging technologies like solid-state drives, ARM-based processors, and photonic computing promise even greater efficiency gains. The goal is clear: a carbon-neutral cloud infrastructure by 2030, powering the digital economy without environmental cost.`,
        category: "Sustainability",
        tags: ["Green Tech", "Data Centers", "Cloud", "Environment"],
        published: true
    },
    {
        title: "Web3 and Decentralization: Beyond the Hype",
        content: `After years of speculation and volatility, Web3 technologies are finding practical applications beyond cryptocurrency. Decentralized systems offer genuine solutions to problems of data ownership, digital identity, and platform monopolies.

Decentralized identity systems allow users to control their personal data, sharing only what's necessary with each service. This approach contrasts sharply with current models where tech giants aggregate user information. Early adopters report reduced data breaches and improved privacy.

Practical Web3 applications gaining traction:
- Supply chain transparency using blockchain to track products from origin to consumer
- Decentralized social networks where users own their content and connections
- Digital credentials and certifications that can't be forged or revoked arbitrarily
- Peer-to-peer energy trading in smart grid systems
- Decentralized autonomous organizations (DAOs) for community governance

The technology faces challenges. Scalability, energy consumption, and user experience remain concerns. However, new protocols address these issues—proof-of-stake reduces energy use, layer-2 solutions improve speed, and better interfaces hide complexity.

Critics argue that decentralization often recreates centralization in new forms. The reality is nuanced: Web3 offers tools for building more equitable systems, but implementation determines whether those tools serve their intended purpose.`,
        category: "Blockchain",
        tags: ["Web3", "Blockchain", "Decentralization", "Privacy"],
        published: true
    },
    {
        title: "Edge AI: Intelligence Moves to the Device",
        content: `Artificial intelligence is migrating from cloud servers to edge devices—smartphones, cameras, sensors, and embedded systems. This shift enables real-time processing, enhanced privacy, and operation without internet connectivity.

Edge AI chips from companies like Apple, Qualcomm, and NVIDIA bring neural network processing to consumer devices. Your smartphone can now perform complex AI tasks—from photo enhancement to language translation—without sending data to remote servers.

Advantages of edge AI:
- Instant response times without network latency
- Privacy protection by keeping sensitive data on-device
- Reduced bandwidth costs and cloud infrastructure expenses
- Reliability in areas with poor or no internet connectivity
- Energy efficiency through specialized AI processors

Applications span industries. Autonomous vehicles process sensor data locally for split-second decisions. Smart cameras identify security threats without cloud uploads. Medical devices analyze patient data while maintaining HIPAA compliance. Industrial sensors predict equipment failures in real-time.

The technology democratizes AI, making advanced capabilities accessible in resource-constrained environments. Developing nations benefit from AI-powered agriculture, healthcare, and education tools that don't require expensive cloud infrastructure.

Challenges include limited processing power compared to data centers and the complexity of updating models on millions of distributed devices. However, advances in model compression and federated learning address these limitations.`,
        category: "Artificial Intelligence",
        tags: ["Edge Computing", "AI", "Mobile", "Privacy"],
        published: true
    },
    {
        title: "Neurotechnology: The Brain-Computer Interface Revolution",
        content: `Brain-computer interfaces (BCIs) are transitioning from science fiction to medical reality. Non-invasive devices can now detect brain signals with unprecedented accuracy, enabling control of computers, prosthetics, and even communication for paralyzed patients.

Recent FDA approvals for BCI medical devices mark a turning point. Patients with spinal cord injuries use thought-controlled robotic arms with natural dexterity. People with locked-in syndrome communicate by thinking about letters, which AI translates into text.

Current BCI applications:
- Restoration of movement for paralysis patients through neural prosthetics
- Communication systems for individuals with severe speech impairments
- Treatment of neurological conditions like epilepsy and Parkinson's disease
- Enhanced focus and cognitive performance for healthy users
- Gaming and entertainment experiences controlled by thought

The technology combines neuroscience, AI, and advanced sensors. Machine learning algorithms decode brain signals, learning individual neural patterns to improve accuracy over time. Some systems achieve 95% accuracy in translating thoughts to actions.

Ethical questions abound. Who owns brain data? How do we prevent misuse of thought-reading technology? What are the implications for privacy and autonomy? Researchers and ethicists are developing frameworks to address these concerns before widespread adoption.

Consumer applications remain years away, but the medical benefits are immediate and transformative. For millions with disabilities, BCIs represent not just technology—but independence and quality of life.`,
        category: "Neurotechnology",
        tags: ["BCI", "Healthcare", "Innovation", "Ethics"],
        published: true
    },
    {
        title: "5G and Beyond: The Connectivity Revolution Accelerates",
        content: `5G networks have matured beyond initial hype, delivering on promises of ultra-fast, low-latency connectivity. More importantly, research into 6G is already revealing possibilities that seemed impossible just years ago.

Current 5G deployments enable applications that 4G couldn't support. Remote surgery with haptic feedback, massive IoT deployments with millions of connected devices, and cloud gaming with imperceptible lag are now realities in major cities worldwide.

5G enabling new possibilities:
- Autonomous vehicle communication and coordination
- Industrial automation with real-time sensor networks
- Augmented reality experiences with cloud rendering
- Telemedicine with high-definition video and remote diagnostics
- Smart city infrastructure for traffic, utilities, and public safety

Meanwhile, 6G research targets 2030 deployment with even more ambitious goals. Theoretical speeds reach 1 terabit per second—fast enough to download 100 HD movies in one second. More significantly, 6G aims to integrate sensing, positioning, and communication in a single network.

Potential 6G applications include holographic telepresence, brain-computer interfaces requiring massive bandwidth, and environmental sensing at unprecedented scales. The technology could enable "digital twins" of entire cities, updated in real-time for urban planning and emergency response.

Challenges include infrastructure costs, energy consumption, and ensuring equitable access. The digital divide risks widening if advanced connectivity remains limited to wealthy areas. Policymakers and industry leaders are working to ensure next-generation networks benefit everyone.`,
        category: "Telecommunications",
        tags: ["5G", "6G", "Connectivity", "Infrastructure"],
        published: true
    }
];

async function importBlogPosts() {
    try {
        console.log('🚀 Starting blog post import...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dataworld');
        console.log('✅ Connected to MongoDB\n');

        // Find an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ No admin user found!');
            console.log('\nPlease create an admin account first:');
            console.log('1. Add your email to ADMIN_EMAILS in server/.env');
            console.log('2. Sign up at http://localhost:5173/signup with that email\n');
            process.exit(1);
        }

        console.log(`📝 Found admin user: ${adminUser.username} (${adminUser.email})\n`);

        // Check for existing posts
        const existingCount = await BlogPost.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Warning: ${existingCount} blog post(s) already exist in the database.`);
            console.log('This script will add 8 more posts.\n');
        }

        // Import posts
        let successCount = 0;
        for (const postData of samplePosts) {
            try {
                const post = new BlogPost({
                    ...postData,
                    author: adminUser._id
                });
                await post.save();
                console.log(`✅ Created: "${post.title}"`);
                successCount++;
            } catch (error: any) {
                console.error(`❌ Failed to create "${postData.title}":`, error.message);
            }
        }

        console.log(`\n🎉 Import complete! Successfully created ${successCount} out of ${samplePosts.length} posts.`);
        console.log('\n📱 View your blog at: http://localhost:5173/blog');
        console.log('🔧 Manage posts at: http://localhost:5173/admin\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    }
}

// Run the import
importBlogPosts();
