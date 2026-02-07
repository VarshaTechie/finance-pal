import { useState } from 'react';
import { Wallet, CheckCircle, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { incomeApi, IncomeSource } from '@/services/api';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const incomeSources: { value: IncomeSource; label: string; icon: string }[] = [
  { value: 'Salary', label: 'Salary', icon: '💼' },
  { value: 'Freelance', label: 'Freelance', icon: '💻' },
  { value: 'Business', label: 'Business', icon: '🏢' },
  { value: 'Investment', label: 'Investment', icon: '📈' },
  { value: 'Bonus', label: 'Bonus', icon: '🎁' },
  { value: 'Rental', label: 'Rental Income', icon: '🏠' },
  { value: 'Other', label: 'Other', icon: '💰' },
];

const IncomeForm = () => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<IncomeSource>('Salary');
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(currentYear.toString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid income amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await incomeApi.save({
        amount: numAmount,
        currency: '₹',
        month,
        year: parseInt(year),
        source: source,
      });
      
      setSuccess(true);
      toast({
        title: 'Income Saved!',
        description: `Your ${source} income of ₹${numAmount.toLocaleString('en-IN')} for ${month} ${year} has been saved.`,
      });
      
      // Reset form after showing success
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setSource('Salary');
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save income. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="dashboard-card border-success/20">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-scale-in">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">Income Saved Successfully!</h3>
              <p className="text-muted-foreground">
                ₹{parseFloat(amount).toLocaleString('en-IN')} • {source} • {month} {year}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add Income</h1>
        <p className="text-muted-foreground mt-1">
          Record your monthly income to track your savings
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Monthly Income</CardTitle>
                <CardDescription>Enter your income for the selected month</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Income Amount</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="75000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-lg h-12 input-focus"
                    min="0"
                    step="100"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your net income amount after tax deductions
                </p>
              </div>

              {/* Income Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Income Type</Label>
                <Select value={source} onValueChange={(value: IncomeSource) => setSource(value)}>
                  <SelectTrigger id="source" className="h-12">
                    <SelectValue placeholder="Select income type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeSources.map((src) => (
                      <SelectItem key={src.value} value={src.value}>
                        <span className="flex items-center gap-2">
                          <span>{src.icon}</span>
                          <span>{src.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the type of income you're recording
                </p>
              </div>

              {/* Month and Year */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger id="month" className="h-12">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="year" className="h-12">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loading || !amount}
              >
                {loading ? 'Saving...' : 'Save Income'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="dashboard-card mt-6">
          <CardContent className="pt-6">
            <h4 className="font-medium text-foreground mb-3">💡 Tips for Income Tracking</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Add each income source separately (e.g., salary and freelance)</li>
              <li>• All incomes for the same month will be added together</li>
              <li>• Update monthly to keep your budget accurate</li>
              <li>• Include bonuses, commissions, and other one-time payments</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomeForm;
