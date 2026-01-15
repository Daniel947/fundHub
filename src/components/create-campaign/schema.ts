import { z } from 'zod';

export const CATEGORIES = {
    "Health & Medical": [
        "Medical treatments",
        "Surgeries & hospital bills",
        "Chronic illness support",
        "Mental health care",
        "Emergency medical aid"
    ],
    "Disaster Relief & Emergency": [
        "Natural disasters (floods, earthquakes, fires)",
        "Conflict & displacement",
        "Food and shelter emergencies",
        "Rapid response relief"
    ],
    "Education & Skills": [
        "School fees",
        "Scholarships",
        "Vocational training",
        "STEM & digital skills",
        "Educational infrastructure"
    ],
    "Community & Social Causes": [
        "Poverty alleviation",
        "Women & youth empowerment",
        "Disability support",
        "Elderly care",
        "Community infrastructure"
    ],
    "Environment & Climate": [
        "Climate action",
        "Tree planting",
        "Clean water",
        "Renewable energy",
        "Conservation & wildlife protection"
    ],
    "Nonprofits & NGOs": [
        "NGO operational funding",
        "Program expansion",
        "Advocacy & awareness",
        "Capacity building"
    ],
    "Events & Personal Causes": [
        "Weddings",
        "Funerals",
        "Birthdays",
        "Memorials",
        "Personal milestones"
    ],
    "Arts, Culture & Heritage": [
        "Creative projects",
        "Cultural preservation",
        "Film, music, photography",
        "Museums & heritage sites"
    ],
    "Innovation & Technology for Good": [
        "Open-source tools",
        "Civic tech",
        "Health tech",
        "Agri-tech",
        "Social innovation"
    ],
    "Agriculture & Food Security": [
        "Smallholder farmers",
        "Food production",
        "Storage & processing",
        "Agri-infrastructure",
        "Sustainable farming"
    ]
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// Milestone Schema
export const milestoneSchema = z.object({
    id: z.string(), // Temp ID for list management
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    percentage: z.number().min(1).max(100),
    proofType: z.enum(["photo", "document", "data"]),
});

// Allocation Schema
export const allocationSchema = z.object({
    category: z.string(), // e.g., "Marketing", "Development"
    percentage: z.number().min(0).max(100),
});

// Main Campaign Schema
export const campaignSchema = z.object({
    // Step 1: Basics
    title: z.string().min(5, "Title must be at least 5 characters"),
    category: z.string().min(1, "Please select a category"),
    subcategory: z.string().min(1, "Please select a subcategory"),
    description: z.string().min(10, "Description is too short (min 10 chars)"),
    image: z.any().optional(), // For file input mock
    location: z.string().min(2, "Location is required"),

    // Step 2: Funding
    targetAmount: z.number().min(0.01, "Target must be greater than 0"),
    currency: z.enum(["BTC", "ETH", "USDC", "USDT", "S"]),
    duration: z.number().min(1).max(365, "Duration must be between 1 and 365 days"),

    // Step 3: Milestones
    milestones: z.array(milestoneSchema).refine((data) => {
        const total = data.reduce((acc, curr) => acc + curr.percentage, 0);
        return Math.abs(total - 100) < 0.1; // Float tolerance
    }, "Milestone percentages must equal 100%"),

    // Step 4: Allocation
    allocations: z.array(allocationSchema).refine((data) => {
        const total = data.reduce((acc, curr) => acc + curr.percentage, 0);
        return Math.abs(total - 100) < 0.1;
    }, "Allocations must equal 100%"),

    // Step 5: Identity
    orgType: z.enum(["individual", "ngo", "company"]),
    contactEmail: z.string().email(),
    isVerified: z.boolean().refine(val => val === true, {
        message: "Identity verification is required to proceed"
    }),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

export const defaultValues: Partial<CampaignFormData> = {
    currency: "ETH",
    duration: 30,
    milestones: [{ id: '1', title: 'Initial Setup', description: 'Project initialization and planning', percentage: 100, proofType: 'document' }],
    allocations: [
        { category: 'Development', percentage: 50 },
        { category: 'Marketing', percentage: 20 },
        { category: 'Operations', percentage: 30 }
    ],
    orgType: 'individual',
    isVerified: false,
};
