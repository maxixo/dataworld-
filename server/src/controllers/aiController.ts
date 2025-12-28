import { Request, Response } from 'express';
import OpenAI from 'openai';

// Initialize OpenAI client lazily (only when needed) for Z.AI
let zaiClient: OpenAI | null = null;

const getZAIClient = () => {
    if (!zaiClient) {
        const apiKey = process.env.ZAI_API_KEY;
        if (!apiKey) {
            throw new Error('ZAI_API_KEY is not configured');
        }
        zaiClient = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.z.ai/api/paas/v4/"
        });
    }
    return zaiClient;
};

export const generateInsights = async (req: Request, res: Response) => {
    try {
        const { data, columns, chartType, xAxis, yAxis } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: 'Invalid data provided' });
        }

        // Prepare a summary of the data for the AI
        const dataSummary = {
            totalRows: data.length,
            columns: columns,
            xAxis: xAxis,
            yAxis: yAxis,
            chartType: chartType,
            sampleRows: data.slice(0, 5),
            numericColumns: columns.filter((col: string) => 
                data.some(row => typeof row[col] === 'number')
            ),
            uniqueValues: columns.map((col: string) => {
                const uniqueSet = new Set(data.map((row: any) => row[col]));
                return {
                    column: col,
                    uniqueCount: uniqueSet.size,
                    sampleValues: Array.from(uniqueSet).slice(0, 5)
                };
            })
        };

        // Calculate basic statistics
        const numericStats = dataSummary.numericColumns.reduce((acc: any, col: string) => {
            const values = data
                .map((row: any) => parseFloat(row[col]))
                .filter((val: number) => !isNaN(val));
            
            if (values.length > 0) {
                const sum = values.reduce((a: number, b: number) => a + b, 0);
                const avg = sum / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);
                
                acc[col] = {
                    count: values.length,
                    average: avg.toFixed(2),
                    min: min,
                    max: max,
                    sum: sum.toFixed(2)
                };
            }
            return acc;
        }, {});

        const prompt = `You are a data analysis expert. Analyze the following dataset and provide actionable insights.

Dataset Summary:
- Total Rows: ${dataSummary.totalRows}
- Columns: ${columns.join(', ')}
- Chart Type: ${chartType}
- X Axis: ${xAxis}
- Y Axis: ${yAxis}

Sample Data:
${JSON.stringify(dataSummary.sampleRows, null, 2)}

Numeric Statistics:
${JSON.stringify(numericStats, null, 2)}

Unique Values Summary:
${JSON.stringify(dataSummary.uniqueValues, null, 2)}

Please provide a comprehensive analysis including:
1. Key findings and patterns
2. Notable trends or anomalies
3. Statistical insights
4. Recommendations for further analysis
5. Potential business implications

Format the response in a clear, structured way with bullet points and sections. Keep it concise but informative.`;

        const client = getZAIClient();
        const completion = await client.chat.completions.create({
            model: "glm-4.7",
            messages: [
                {
                    role: "system",
                    content: "You are a data analysis expert who provides clear, actionable insights from datasets."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        const insights = completion.choices[0]?.message?.content || "No insights generated";

        res.json({
            success: true,
            insights: insights,
            statistics: numericStats
        });

    } catch (error: any) {
        console.error('AI Insights Error:', error);
        
        // Check if error is due to missing API key
        if (error.message === 'ZAI_API_KEY is not configured') {
            return res.status(500).json({ 
                message: 'Z.AI API key not configured',
                error: 'Please configure ZAI_API_KEY in server environment variables'
            });
        }
        
        // Check for API authentication errors
        if (error.status === 401 || error.code === 'invalid_api_key') {
            return res.status(500).json({ 
                message: 'Invalid Z.AI API key',
                error: 'Please check your ZAI_API_KEY in server environment variables'
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to generate insights',
            error: error.message 
        });
    }
};