# Task

List out the computational inefficiencies and anti-patterns found in the code block below.

1. This code block uses
    1. ReactJS with TypeScript.
    2. Functional components.
    3. React Hooks
2. You should also provide a refactored version of the code, but more points are awarded to accurately stating the issues and explaining correctly how to improve them.

```
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  if (lhsPriority > -99) {
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}
```

==========================================================================
- Assume that we have `BoxProps`, `useWalletBalances`, `usePrices`, and `WalletRow` imported from other modules in the source project

Several computational inefficiencies and anti-patterns:

### 1. **TypeScript Type Safety Issues**
- `balance.blockchain` is used but not defined in the `WalletBalance` interface
- `lhsPriority` is undefined (typo - should be `balancePriority`)
- `classes` object is used but never defined/imported
- `getPriority` uses `any` type instead of proper typing
- `FormattedWalletBalance` type is defined but used incorrectly

### 2. **Logic Errors**
- Filter logic is inverted - it keeps balances with amount <= 0 instead of filtering them out
- Sort function doesn't return 0 for equal priorities
- `formattedBalances` is computed but never used (rows maps over `sortedBalances` instead)

### 3. **Performance Inefficiencies**
- `getPriority` is called multiple times for the same item during sorting
- `prices` is in the useMemo dependency array but never used in the computation
- Missing proper memoization for formatted balances

### 4. **React Anti-patterns**
- Using array index as key when rendering sorted lists (causes issues with animations and state)
- Props spreading on div might pass invalid HTML attributes from BoxProps

### 5. **Code Quality Issues**
- `getPriority` could be a pure function outside the component
- `toFixed()` without arguments doesn't ensure consistent decimal formatting
- Duplicate priority values (Zilliqa and Neo both have 20)

## Key Improvements in the Refactored Version:

1. **Type Safety**: Added the missing `blockchain` property to `WalletBalance` interface and created proper types
2. **Performance**: Moved `getPriority` outside component and used a lookup object for O(1) access
3. **Correct Logic**: Fixed the filter to exclude zero/negative balances (not include them)
4. **Proper Memoization**: Added `useMemo` for `formattedBalances` and `rows` to prevent unnecessary recalculations
5. **Stable Keys**: Used `blockchain-currency` combination instead of array index for React keys
6. **Consistent Formatting**: Used `toFixed(2)` for consistent decimal places
7. **Clean Dependencies**: Removed `prices` from sortedBalances dependencies since it's not used there
8. **Better Sorting**: Added secondary sort by amount and simplified comparison logic
