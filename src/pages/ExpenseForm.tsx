import { useState } from 'react';
import { format } from 'date-fns';
import { CreditCard, CheckCircle, IndianRupee, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { expenseApi, ExpenseCategory } from '@/services/api';
import { cn } from '@/lib/utils';

const categories: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'Food', label: 'Food & Dining', icon: '🍔' },
  { value: 'Travel', label: 'Travel & Transport', icon: '🚗' },
  { value: 'Rent', label: 'Rent & Housing', icon: '🏠' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'Utilities', label: 'Utilities & Bills', icon: '💡' },
  { value: 'Others', label: 'Others', icon: '📦' },
];

const ExpenseForm = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; category?: string; date?: string } = {};
    
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await expenseApi.save({
        amount: parseFloat(amount),
        category: category as ExpenseCategory,
        date: date!.toISOString(),
        description: description.trim() || undefined,
      });
      
      setSuccess(true);
      toast({
        title: 'Expense Added!',
        description: `₹${parseFloat(amount).toLocaleString('en-IN')} expense recorded successfully.`,
      });
      
      // Reset form after showing success
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setCategory('');
        setDate(new Date());
        setDescription('');
        setErrors({});
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
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
              <h3 className="text-2xl font-semibold text-foreground mb-2">Expense Recorded!</h3>
              <p className="text-muted-foreground">
                ₹{parseFloat(amount).toLocaleString('en-IN')} • {category} • {date && format(date, 'PP')}
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
        <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
        <p className="text-muted-foreground mt-1">
          Track your spending by recording each expense
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle>New Expense</CardTitle>
                <CardDescription>Enter the details of your expense</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="500"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount) setErrors({ ...errors, amount: undefined });
                    }}
                    className={cn('pl-10 text-lg h-12 input-focus', errors.amount && 'border-destructive')}
                    min="0"
                    step="1"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value: ExpenseCategory) => {
                    setCategory(value);
                    if (errors.category) setErrors({ ...errors, category: undefined });
                  }}
                >
                  <SelectTrigger 
                    id="category" 
                    className={cn('h-12', errors.category && 'border-destructive')}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        errors.date && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        if (errors.date) setErrors({ ...errors, date: undefined });
                      }}
                      disabled={(d) => d > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date}</p>
                )}
              </div>

              {/* Description (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add a note about this expense..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none input-focus"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Add Expense'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Category Info */}
        <Card className="dashboard-card mt-6">
          <CardContent className="pt-6">
            <h4 className="font-medium text-foreground mb-3">📊 Category Guidelines</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center gap-2 text-muted-foreground">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseForm;
