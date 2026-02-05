

import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import ProductCard from './ProductCard';
import ArrowPathIcon from './icons/ArrowPathIcon';

interface ProductFinderQuizProps {
  products: Product[];
}

const ProductFinderQuiz: React.FC<ProductFinderQuizProps> = ({ products }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<Product | null>(null);

    const questions = [
        {
            id: 'audience',
            text: 'Who are you shopping for?',
            options: useMemo(() => Array.from(new Set(products.flatMap(p => p.analysisResult?.product_analysis.target_audience || []))), [products]),
        },
        {
            id: 'category',
            text: 'What category are you interested in?',
            options: useMemo(() => Array.from(new Set(products.map(p => p.analysisResult?.product_analysis.category || ''))), [products]),
        }
    ];

    const handleAnswer = (questionId: string, option: string) => {
        const newAnswers = { ...answers, [questionId]: option };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: Record<string, string>) => {
        let bestMatch: Product | null = null;
        let highestScore = -1;

        products.forEach(product => {
            let score = 0;
            const analysis = product.analysisResult?.product_analysis;
            if (!analysis) return;

            if (analysis.category === finalAnswers.category) {
                score += 50;
            }
            if (analysis.target_audience.includes(finalAnswers.audience)) {
                score += 50;
            }
            
            // Add product's own score as a tie-breaker
            score += analysis.overall_score / 10;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = product;
            }
        });
        
        setResult(bestMatch);
        setStep(step + 1);
    };
    
    const handleReset = () => {
        setStep(0);
        setAnswers({});
        setResult(null);
    }

    const currentQuestion = questions[step];

    return (
        <div className="py-16">
            <div className="container mx-auto px-4 md:px-8">
                <div className="card p-8 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-2 flex items-center justify-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-primary" />
                        Find Your Perfect Product
                    </h2>
                    <p className="text-center text-muted-foreground mb-8">Answer a couple of questions and our AI will find the best match for you.</p>

                    <div className="min-h-[150px]">
                        {step < questions.length && currentQuestion.options.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{currentQuestion.text}</h3>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {currentQuestion.options.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswer(currentQuestion.id, option)}
                                            className="btn btn-secondary"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {step >= questions.length && result && (
                             <div className="text-center">
                                <h3 className="text-xl font-semibold text-foreground mb-4">Our AI Recommends:</h3>
                                <div className="max-w-sm mx-auto">
                                     <ProductCard product={result} onToggleCompare={() => {}} isComparing={false} />
                                </div>
                                <button onClick={handleReset} className="mt-6 btn btn-secondary">
                                    <ArrowPathIcon className="w-4 h-4 mr-2"/>
                                    Start Over
                                </button>
                            </div>
                        )}

                        {step >= questions.length && !result && (
                            <div className="text-center text-muted-foreground">
                                <p>Sorry, we couldn't find a perfect match based on your answers.</p>
                                 <button onClick={handleReset} className="mt-4 btn btn-secondary">
                                    <ArrowPathIcon className="w-4 h-4 mr-2"/>
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFinderQuiz;