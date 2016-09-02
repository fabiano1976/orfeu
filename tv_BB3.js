//@version=2
strategy(shorttitle="[BB*3+BSS]", title="3bandBB_w/signals", overlay=true)

direction = input(0, title = "Strategy Direction", type=integer, minval=-1, maxval=1)

strategy.risk.allow_entry_in(direction == 0 ? strategy.direction.all : (direction < 0 ? strategy.direction.short : strategy.direction.long))


// Inputs
length = input(20, minval=1)
source = input(close, title="Source")
base_mult = input(2.0, title="Base Multiplier", minval=0.001, maxval=50)
mult_inc = input(0.5, title="Multiplier Increment", minval=0.001, maxval=2)
basis = sma(source, length)

// base bands
dev_0 = base_mult * stdev(source, length)
upper_0 = basis + dev_0
lower_0 = basis - dev_0

// middle bands 1
dev_1 = (base_mult + mult_inc) * stdev(source, length)
upper_1 = basis + dev_1
lower_1 = basis - dev_1

// outer bands 2
dev_2 = (base_mult + (mult_inc * 2)) * stdev(source, length)
upper_2 = basis + dev_2
lower_2 = basis - dev_2

// plot basis
plot(basis, title="Basis Line", color=navy, transp=50)

// plot and fill upper bands
ubi = plot(upper_0, title="Upper Band Inner", color=red, transp=90)
ubm = plot(upper_1, title="Upper Band Middle", color=red, transp=85)
ubo = plot(upper_2, title="Upper Band Outer", color=red, transp=80)
fill(ubi, ubm, title="Upper Bands Inner Fill", color=red, transp=90)
fill(ubm, ubo, title="Upper Bands Outer Fill",color=red, transp=80)

// plot and fill lower bands
lbi = plot(lower_0, title="Lower Band Inner", color=green, transp=90)
lbm = plot(lower_1, title="Lower Band Middle", color=green, transp=85)
lbo = plot(lower_2, title="Lower Band Outer", color=green, transp=80)
fill(lbi, lbm, title="Lower Bands Inner Fill", color=green, transp=90)
fill(lbm, lbo, title="Lower Bands Outer Fill", color=green, transp=80)

// center channel fill
fill(ubi, lbi, title="Center Channel Fill", color=silver, transp=100)

// Imported Trading Strategy
upper = upper_2
lower = lower_2

buyEntry = crossover(source, lower)
sellEntry = crossunder(source, upper)

if (crossover(source, lower))
    strategy.entry("BBandLE", strategy.long, stop=lower, oca_name="Lower Band Outer", oca_type=strategy.oca.cancel, comment="BBandLE")
else
    strategy.cancel(id="BBandLE")

if (crossunder(source, upper))
    strategy.entry("BBandSE", strategy.short, stop=upper, oca_name="Upper Band Outer", oca_type=strategy.oca.cancel, comment="BBandSE")
else
    strategy.cancel(id="BBandSE")

//plot(strategy.equity, title="equity", color=red, linewidth=2, style=areabr)