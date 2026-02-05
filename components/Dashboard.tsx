import React, { useEffect, useMemo } from 'react';
import Header from './Header';
import AnalyticsSummary from './AnalyticsSummary';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import DashboardControls from './DashboardControls';
import AnalysisModal from './AnalysisModal';
import ResultsModal from './ResultsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ActionConfirmationModal from './ActionConfirmationModal';
import ContentHub from './ContentHub';
import ArticlePreviewModal from './ArticlePreviewModal';
import StrategyHub from './StrategyHub';
import AbTestModal from './AbTestModal';
import CommandBar from './CommandBar';
import ApiKeyWarningBanner from './ApiKeyWarningBanner';
import Terminal from './Terminal';
import AiVisibilityDashboard from './AiVisibilityDashboard';
import SeoStrategyReportModal from './SeoStrategyReportModal';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';
import Squares2x2Icon from './icons/Squares2x2Icon';
import NewspaperIcon from './icons/NewspaperIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import EyeIcon from './icons/EyeIcon';
import ServerIcon from './icons/ServerIcon';

interface DashboardProps {
  publishedCount: number;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ publishedCount, onLogout }) => {
    const { isConfigured } = useSettings();
    const { products, articles } = useData();
    const { state, setters, computed, actions } = useDashboardLogic();

    // Keyboard shortcut for Command Bar
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setters.setIsCommandBarOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setters]);

    const handleCommandBarResult = (result: CommandBarResult) => {
        setters.setIsCommandBarOpen(false);
        if (result.action === 'UI_UPDATE') {
            const { name, args } = result.payload || {};
            if (name === 'navigateTo' && args?.tab) setters.setActiveTab(args.tab as string);
            if (name === 'findContent') {
                if (args?.status) setters.setFilterStatus(args.status as string);
                if (args?.term) setters.setSearchTerm(args.term as string);
                setters.setActiveTab('products');
            }
        }
    };

    // Memoize derived data for modals
    const productForAnalysisModal = useMemo(() => 
        state.taskForModal ? products.find(p => p.id === state.taskForModal!.contentId) ?? null : null
    , [state.taskForModal, products]);

    const articleForAnalysisModal = useMemo(() => 
        state.taskForModal ? articles.find(a => a.id === state.taskForModal!.contentId) ?? null : null
    , [state.taskForModal, articles]);

    const tabs = [
        { id: 'products', label: 'Products', icon: Squares2x2Icon },
        { id: 'content', label: 'Content Hub', icon: NewspaperIcon },
        { id: 'strategy', label: 'Strategy', icon: LightBulbIcon },
        { id: 'visibility', label: 'AI Visibility', icon: EyeIcon },
        { id: 'monitor', label: 'System Monitor', icon: ServerIcon },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <Header
                publishedCount={publishedCount}
                onLogout={onLogout}
                onToggleCommandBar={() => setters.setIsCommandBarOpen(p => !p)}
            />
            <main className="flex-grow container mx-auto px-4 py-8 md:px-8 max-w-7xl">
                {!isConfigured && <ApiKeyWarningBanner />}
    
                <div className="mb-8">
                    <nav className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = state.activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setters.setActiveTab(tab.id)}
                                    className={`
                                        flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                                        ${isActive 
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="animate-fadeIn">
                    {state.activeTab === 'products' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-1 space-y-8">
                                <AnalyticsSummary />
                                <ProductForm onAddProduct={actions.handleAddProduct} />
                            </div>
                            <div className="lg:col-span-2 space-y-6">
                                <DashboardControls
                                    searchTerm={state.searchTerm}
                                    setSearchTerm={setters.setSearchTerm}
                                    filterStatus={state.filterStatus}
                                    setFilterStatus={setters.setFilterStatus}
                                />
                                <ProductList
                                    products={computed.filteredProducts}
                                    onViewResults={(product) => { setters.setSelectedProduct(product); setters.setInitialModalTab('review'); }}
                                    onDelete={(item) => setters.setItemToDelete(item)}
                                    onConfirmAction={(product, action) => { setters.setProductToConfirmAction(product); setters.setActionToConfirm(action); }}
                                    onGetSuggestions={actions.onGetSuggestions}
                                    onGenerateVideoScript={actions.onGenerateVideoScript}
                                />
                            </div>
                        </div>
                    )}
                    
                    {state.activeTab === 'content' && (
                        <ContentHub 
                            onViewArticle={(article) => setters.setArticleToPreview(article)}
                            onDeleteArticle={(article) => setters.setItemToDelete(article)}
                            onGenerateArticle={actions.handleGenerateArticle}
                            onRunAutolink={actions.onRunAutolink}
                        />
                    )}
                    
                    {state.activeTab === 'strategy' && (
                        <StrategyHub
                            opportunities={state.opportunities}
                            setOpportunities={setters.setOpportunities}
                            onAnalyzeOpportunity={(topic, url) => {
                                actions.handleAddProduct(topic, url);
                                setters.setActiveTab('products');
                            }}
                            onRefreshProduct={actions.onRefreshProduct}
                            activeTasks={computed.activeTaskIds}
                            onAddTask={(id) => { /* Task added automatically by hook mechanism usually, but exposed here if manual add needed */ }}
                        />
                    )}

                    {state.activeTab === 'visibility' && <AiVisibilityDashboard />}
                    {state.activeTab === 'monitor' && <Terminal />}
                </div>

            </main>
    
            {/* Modals */}
            {state.taskForModal && (
                <AnalysisModal
                    isOpen={true}
                    onClose={() => setters.setTaskForModal(null)}
                    task={state.taskForModal}
                    productName={productForAnalysisModal?.title || articleForAnalysisModal?.title || 'New Content'}
                />
            )}
    
            {state.selectedProduct && state.selectedProduct.analysisResult && (
                <ResultsModal
                    isOpen={true}
                    onClose={() => setters.setSelectedProduct(null)}
                    product={state.selectedProduct}
                    onProductUpdate={() => {}} // Updates handled via DataContext/Optimistic UI in hook
                    initialTab={state.initialModalTab}
                    onEnhanceProduct={actions.onEnhanceProduct}
                    onGetSuggestions={actions.onGetSuggestions}
                    onGenerateAbTest={actions.onGenerateAbTest}
                    onGenerateVisuals={actions.onGenerateVisuals}
                    onGenerateVideoScript={actions.onGenerateVideoScript}
                    onAcceptUpdate={actions.onAcceptUpdate}
                    onDiscardUpdate={actions.onDiscardUpdate}
                />
            )}
            
            {state.articleToPreview && (
                <ArticlePreviewModal
                    isOpen={true}
                    onClose={() => setters.setArticleToPreview(null)}
                    article={state.articleToPreview}
                    onGetSuggestions={actions.onGetArticleSuggestions}
                    onEnhanceArticle={actions.onEnhanceArticle}
                    onEnhanceArticleWithAllSuggestions={actions.onEnhanceArticleAll}
                    onRunAutolink={actions.onRunAutolink}
                />
            )}

            {state.abTestToShow && (
                <AbTestModal
                    isOpen={true}
                    onClose={() => setters.setAbTestToShow(null)}
                    abTest={state.abTestToShow}
                    onApply={() => { /* Mock apply */ }}
                />
            )}

            {state.seoReportToShow && (
                <SeoStrategyReportModal
                    isOpen={true}
                    onClose={() => setters.setSeoReportToShow(null)}
                    report={state.seoReportToShow}
                />
            )}
    
            {state.itemToDelete && (
                <DeleteConfirmationModal
                    itemName={state.itemToDelete.title}
                    onConfirm={async () => { await actions.handleDelete(); return "Deleted"; }}
                    onCancel={() => setters.setItemToDelete(null)}
                />
            )}
    
            {state.productToConfirmAction && state.actionToConfirm && (
                <ActionConfirmationModal
                    product={state.productToConfirmAction}
                    actionType={state.actionToConfirm}
                    onConfirm={async () => { await actions.handleConfirmAction(); return "Updated"; }}
                    onCancel={() => setters.setProductToConfirmAction(null)}
                />
            )}

            <CommandBar
                isOpen={state.isCommandBarOpen}
                onClose={() => setters.setIsCommandBarOpen(false)}
                onCommandExecuted={handleCommandBarResult}
            />
        </div>
    );
};

export default Dashboard;