// Dashboard JavaScript functionality
class ICSAdvisoryDashboard {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.chart = null;
        
        // Wait for libraries to load or use fallbacks
        this.waitForLibraries().then(() => {
            this.init();
        });
    }

    async waitForLibraries() {
        // Wait a moment for CDN scripts to load
        return new Promise(resolve => {
            setTimeout(() => {
                // If Papa isn't loaded, provide simple CSV parser
                if (typeof Papa === 'undefined') {
                    window.Papa = {
                        parse: function(csv, options) {
                            try {
                                const lines = csv.split('\n');
                                if (lines.length === 0) return { data: [], errors: [] };
                                
                                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                                const data = [];
                                
                                for (let i = 1; i < lines.length; i++) {
                                    if (lines[i].trim()) {
                                        // Simple CSV parsing - handles basic cases
                                        const values = [];
                                        let current = '';
                                        let inQuotes = false;
                                        
                                        for (let j = 0; j < lines[i].length; j++) {
                                            const char = lines[i][j];
                                            if (char === '"') {
                                                inQuotes = !inQuotes;
                                            } else if (char === ',' && !inQuotes) {
                                                values.push(current.trim().replace(/"/g, ''));
                                                current = '';
                                            } else {
                                                current += char;
                                            }
                                        }
                                        values.push(current.trim().replace(/"/g, ''));
                                        
                                        const row = {};
                                        headers.forEach((header, index) => {
                                            row[header] = values[index] || '';
                                        });
                                        data.push(row);
                                    }
                                }
                                
                                return { data: data, errors: [] };
                            } catch (error) {
                                console.error('CSV parsing error:', error);
                                return { data: [], errors: [error] };
                            }
                        }
                    };
                }
                resolve();
            }, 1000);
        });
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.updateStatistics();
            this.populateDropdowns();
            this.createChart();
            this.updateTable();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Failed to load data. Please try refreshing the page.');
        }
    }

    async loadData() {
        try {
            const response = await fetch('ICS-CERT_ADV/CISA_ICS_ADV_Master.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            
            // Parse CSV with Papa or fallback parser
            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim()
            });

            if (result.errors.length > 0) {
                console.warn('CSV parsing warnings:', result.errors);
            }

            this.data = result.data.filter(row => 
                row['ICS-CERT_Number'] && 
                row['ICS-CERT_Number'].trim() !== ''
            );
            
            this.filteredData = [...this.data];
            console.log(`Loaded ${this.data.length} advisory records`);
        } catch (error) {
            console.error('Error loading CSV data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Search and filter controls
        const vendorSearch = document.getElementById('vendorSearch');
        const alertCodeSearch = document.getElementById('alertCodeSearch');
        const countrySelect = document.getElementById('countrySelect');
        
        if (vendorSearch) vendorSearch.addEventListener('change', () => this.applyFilters());
        if (alertCodeSearch) alertCodeSearch.addEventListener('input', () => this.applyFilters());
        if (countrySelect) countrySelect.addEventListener('change', () => this.applyFilters());
        
        // Pagination controls
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (prevPage) prevPage.addEventListener('click', () => this.previousPage());
        if (nextPage) nextPage.addEventListener('click', () => this.nextPage());
        
        // Newsletter signup
        const signupBtn = document.querySelector('.btn-signup');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                alert('Newsletter signup feature would be implemented here!');
            });
        }
    }

    updateStatistics() {
        const totalAdvisories = this.filteredData.length;
        
        // Count unique vendors
        const vendors = new Set();
        this.filteredData.forEach(row => {
            if (row.Vendor && row.Vendor.trim()) {
                // Split by comma and add each vendor
                row.Vendor.split(',').forEach(vendor => {
                    vendors.add(vendor.trim());
                });
            }
        });
        
        // Count unique products
        const products = new Set();
        this.filteredData.forEach(row => {
            if (row.Product && row.Product.trim()) {
                products.add(row.Product.trim());
            }
        });

        // Update the display
        const totalAdvisoriesEl = document.getElementById('totalAdvisories');
        const totalVendorsEl = document.getElementById('totalVendors');
        const totalProductsEl = document.getElementById('totalProducts');
        
        if (totalAdvisoriesEl) totalAdvisoriesEl.textContent = totalAdvisories.toLocaleString();
        if (totalVendorsEl) totalVendorsEl.textContent = vendors.size.toLocaleString();
        if (totalProductsEl) totalProductsEl.textContent = products.size.toLocaleString();
    }

    populateDropdowns() {
        // Populate vendor dropdown
        const vendors = new Set();
        this.data.forEach(row => {
            if (row.Vendor && row.Vendor.trim()) {
                row.Vendor.split(',').forEach(vendor => {
                    vendors.add(vendor.trim());
                });
            }
        });

        const vendorSelect = document.getElementById('vendorSearch');
        if (vendorSelect) {
            vendorSelect.innerHTML = '<option value="">All Vendors</option>';
            
            Array.from(vendors).sort().forEach(vendor => {
                const option = document.createElement('option');
                option.value = vendor;
                option.textContent = vendor;
                vendorSelect.appendChild(option);
            });
        }

        // Populate country dropdown
        const countries = new Set();
        this.data.forEach(row => {
            if (row.Company_Headquarters && row.Company_Headquarters.trim()) {
                countries.add(row.Company_Headquarters.trim());
            }
        });

        const countrySelect = document.getElementById('countrySelect');
        if (countrySelect) {
            countrySelect.innerHTML = '<option value="">All Countries</option>';
            
            Array.from(countries).sort().forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
    }

    applyFilters() {
        const vendorFilter = document.getElementById('vendorSearch')?.value || '';
        const alertCodeFilter = document.getElementById('alertCodeSearch')?.value.toLowerCase() || '';
        const countryFilter = document.getElementById('countrySelect')?.value || '';

        this.filteredData = this.data.filter(row => {
            // Vendor filter
            if (vendorFilter && (!row.Vendor || !row.Vendor.toLowerCase().includes(vendorFilter.toLowerCase()))) {
                return false;
            }

            // Alert code filter
            if (alertCodeFilter && (!row['ICS-CERT_Number'] || !row['ICS-CERT_Number'].toLowerCase().includes(alertCodeFilter))) {
                return false;
            }

            // Country filter
            if (countryFilter && (!row.Company_Headquarters || row.Company_Headquarters !== countryFilter)) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.updateStatistics();
        this.updateChart();
        this.updateTable();
    }

    createChart() {
        const canvas = document.getElementById('vendorChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Count advisories by country
        const countryCounts = {};
        this.filteredData.forEach(row => {
            if (row.Company_Headquarters && row.Company_Headquarters.trim()) {
                const country = row.Company_Headquarters.trim();
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            }
        });

        // Sort and take top 10
        const sortedCountries = Object.entries(countryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedCountries.map(([country]) => country);
        const data = sortedCountries.map(([,count]) => count);

        // If Chart.js is available, use it
        if (typeof Chart !== 'undefined' && Chart) {
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'CISA ICS Advisories Per Vendors',
                        data: data,
                        backgroundColor: '#3498db',
                        borderColor: '#2980b9',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                color: '#ecf0f1'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        } else {
            // Fallback: create a simple HTML chart
            this.createSimpleChart(labels, data);
        }
    }

    createSimpleChart(labels, data) {
        const chartContainer = document.querySelector('.chart-wrapper');
        if (!chartContainer) return;

        const maxValue = Math.max(...data);
        
        chartContainer.innerHTML = `
            <div style="height: 300px; overflow-y: auto; padding: 10px;">
                ${labels.map((label, index) => {
                    const percentage = (data[index] / maxValue) * 100;
                    return `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 120px; font-size: 12px; text-align: right; padding-right: 8px;">${label}</div>
                            <div style="flex: 1; background: #ecf0f1; height: 20px; position: relative;">
                                <div style="background: #3498db; height: 100%; width: ${percentage}%;"></div>
                                <span style="position: absolute; right: 4px; top: 2px; font-size: 12px; color: #2c3e50;">${data[index]}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    updateChart() {
        if (this.chart && typeof Chart !== 'undefined') {
            // Recalculate data for current filters
            const countryCounts = {};
            this.filteredData.forEach(row => {
                if (row.Company_Headquarters && row.Company_Headquarters.trim()) {
                    const country = row.Company_Headquarters.trim();
                    countryCounts[country] = (countryCounts[country] || 0) + 1;
                }
            });

            const sortedCountries = Object.entries(countryCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);

            const labels = sortedCountries.map(([country]) => country);
            const data = sortedCountries.map(([,count]) => count);

            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data;
            this.chart.update();
        } else {
            // Recreate simple chart
            const countryCounts = {};
            this.filteredData.forEach(row => {
                if (row.Company_Headquarters && row.Company_Headquarters.trim()) {
                    const country = row.Company_Headquarters.trim();
                    countryCounts[country] = (countryCounts[country] || 0) + 1;
                }
            });

            const sortedCountries = Object.entries(countryCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);

            const labels = sortedCountries.map(([country]) => country);
            const data = sortedCountries.map(([,count]) => count);
            
            this.createSimpleChart(labels, data);
        }
    }

    updateTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="loading-cell">No data matches the current filters.</td></tr>';
        } else {
            tableBody.innerHTML = pageData.map(row => `
                <tr>
                    <td>${this.escapeHtml(row['ICS-CERT_Number'] || '')}</td>
                    <td>${this.escapeHtml(row.Original_Release_Date || '')}</td>
                    <td>${this.escapeHtml(row['ICS-CERT_Advisory_Title'] || '')}</td>
                    <td>${this.escapeHtml(row.Vendor || '')}</td>
                    <td>${this.escapeHtml(row.Product || '')}</td>
                    <td>${this.escapeHtml(row.Company_Headquarters || '')}</td>
                    <td>${this.escapeHtml(row.CVE_Number || '')}</td>
                    <td>${this.escapeHtml(row.CVSS_Severity || '')}</td>
                </tr>
            `).join('');
        }

        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length);

        // Update controls
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        const resultsInfo = document.getElementById('resultsInfo');

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
        if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        // Update results info
        if (resultsInfo) {
            if (this.filteredData.length === 0) {
                resultsInfo.textContent = 'No results found';
            } else {
                resultsInfo.textContent = 
                    `Showing ${startIndex + 1}-${endIndex} of ${this.filteredData.length.toLocaleString()} results`;
            }
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateTable();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateTable();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const tableBody = document.getElementById('tableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="color: #e74c3c;">${message}</td></tr>`;
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ICSAdvisoryDashboard();
});