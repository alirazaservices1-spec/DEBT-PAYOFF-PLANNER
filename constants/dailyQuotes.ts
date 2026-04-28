// 365-day quote set - 5 quotes per day with category tags
  // Source: DebtPath 365x5 Daily Motivational Quotes
  // Index 0 = Day 1 (use dayOfYear - 1 as index)

  export interface QuoteEntry {
    text: string;
    category: string;
  }

  export interface DailyQuoteSet {
    day: number;
    quotes: QuoteEntry[];
  }

  export const DAILY_QUOTE_SETS: readonly DailyQuoteSet[] = [
    { day: 1, quotes: [
    { text: 'Every dollar you put toward debt is a dollar invested in your freedom.', category: 'Financial Freedom' },
    { text: 'Debt is the thief of tomorrow\'s choices. Take them back today.', category: 'Financial Freedom' },
    { text: 'Financial freedom isn\'t about being rich. It\'s about having options.', category: 'Financial Freedom' },
    { text: 'The best time to start paying off debt was years ago. The second best is now.', category: 'Financial Freedom' },
    { text: 'You don\'t need a perfect plan. You need a first payment.', category: 'Financial Freedom' }
  ] },
  { day: 2, quotes: [
    { text: 'Money problems are temporary. The habits you build solving them are permanent.', category: 'Financial Freedom' },
    { text: 'Every debt you pay off is a chain you break.', category: 'Financial Freedom' },
    { text: 'Being debt-free isn\'t a destination. It\'s how you travel through life.', category: 'Financial Freedom' },
    { text: 'Wealth isn\'t what you earn. It\'s what you keep after bills are paid.', category: 'Financial Freedom' },
    { text: 'A budget isn\'t a punishment. It\'s permission to spend without guilt.', category: 'Financial Freedom' }
  ] },
  { day: 3, quotes: [
    { text: 'You are not your credit score. But improving it feels great.', category: 'Financial Freedom' },
    { text: 'The interest you\'re not paying is the raise you gave yourself.', category: 'Financial Freedom' },
    { text: 'Financial peace is worth more than anything you could buy on credit.', category: 'Financial Freedom' },
    { text: 'Stop paying for yesterday. Start investing in tomorrow.', category: 'Financial Freedom' },
    { text: 'Every paycheck is a fresh chance to change your financial future.', category: 'Financial Freedom' }
  ] },
  { day: 4, quotes: [
    { text: 'You didn\'t get into debt overnight. You won\'t get out overnight. But you will.', category: 'Financial Freedom' },
    { text: 'The road to financial freedom is paved with boring consistent payments.', category: 'Financial Freedom' },
    { text: 'Your future self will thank you for every sacrifice you make today.', category: 'Financial Freedom' },
    { text: 'Debt is a promise to your past. Freedom is a promise to your future.', category: 'Financial Freedom' },
    { text: 'When you owe nothing everything you earn is yours.', category: 'Financial Freedom' }
  ] },
  { day: 5, quotes: [
    { text: 'A debt-free life isn\'t about deprivation. It\'s about liberation.', category: 'Financial Freedom' },
    { text: 'You\'re not behind. You\'re exactly where your comeback starts.', category: 'Financial Freedom' },
    { text: 'The freedom you want is on the other side of the payments you\'re making.', category: 'Financial Freedom' },
    { text: 'The sacrifice is temporary. The freedom is permanent.', category: 'Financial Freedom' },
    { text: 'Compound interest works against you in debt. Make it work for you in savings.', category: 'Financial Freedom' }
  ] },
  { day: 6, quotes: [
    { text: 'Money is a tool. Debt is a trap. Freedom is the goal.', category: 'Financial Freedom' },
    { text: 'Live below your means today so you can live beyond them tomorrow.', category: 'Financial Freedom' },
    { text: 'The goal isn\'t to be rich. It\'s to be free.', category: 'Financial Freedom' },
    { text: 'Imagine waking up owing nothing. That morning is coming.', category: 'Financial Freedom' },
    { text: 'Broke is temporary. Poor is a mindset. You\'re choosing neither.', category: 'Financial Freedom' }
  ] },
  { day: 7, quotes: [
    { text: 'The best investment you\'ll ever make is paying off what you owe.', category: 'Financial Freedom' },
    { text: 'Every payment is proof that you chose your future over your past.', category: 'Financial Freedom' },
    { text: 'You are closer to debt-free today than you were yesterday.', category: 'Financial Freedom' },
    { text: 'Budgeting is telling your money where to go instead of wondering where it went.', category: 'Financial Freedom' },
    { text: 'The gap between your income and your spending is where freedom lives.', category: 'Financial Freedom' }
  ] },
  { day: 8, quotes: [
    { text: 'Your financial story isn\'t over. This is just the plot twist.', category: 'Financial Freedom' },
    { text: 'Don\'t compare your chapter one to someone else\'s chapter twenty.', category: 'Financial Freedom' },
    { text: 'Financial freedom is the ultimate form of self-care.', category: 'Financial Freedom' },
    { text: 'Money doesn\'t buy happiness but being free from debt buys peace.', category: 'Financial Freedom' },
    { text: 'There\'s no shame in having debt. There\'s power in deciding to end it.', category: 'Financial Freedom' }
  ] },
  { day: 9, quotes: [
    { text: 'Fall seven times stand up eight.', category: 'Perseverance' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', category: 'Perseverance' },
    { text: 'The only way out is through. Keep going.', category: 'Perseverance' },
    { text: 'Success is not final failure is not fatal: it is the courage to continue that counts.', category: 'Perseverance' },
    { text: 'A river cuts through rock not by power but by persistence.', category: 'Perseverance' }
  ] },
  { day: 10, quotes: [
    { text: 'You haven\'t come this far to only come this far.', category: 'Perseverance' },
    { text: 'Difficult roads often lead to beautiful destinations.', category: 'Perseverance' },
    { text: 'When you feel like quitting remember why you started.', category: 'Perseverance' },
    { text: 'The struggle you\'re in today is developing the strength you need for tomorrow.', category: 'Perseverance' },
    { text: 'Every setback is a setup for a comeback.', category: 'Perseverance' }
  ] },
  { day: 11, quotes: [
    { text: 'The moment you\'re ready to quit is usually right before a breakthrough.', category: 'Perseverance' },
    { text: 'Progress not perfection is what matters.', category: 'Perseverance' },
    { text: 'It always seems impossible until it\'s done.', category: 'Perseverance' },
    { text: 'If you\'re going through hell keep going.', category: 'Perseverance' },
    { text: 'The pain you feel today will be the strength you feel tomorrow.', category: 'Perseverance' }
  ] },
  { day: 12, quotes: [
    { text: 'Tough times never last but tough people do.', category: 'Perseverance' },
    { text: 'Small progress is still progress.', category: 'Perseverance' },
    { text: 'Storms make trees take deeper roots.', category: 'Perseverance' },
    { text: 'Your current situation is not your final destination.', category: 'Perseverance' },
    { text: 'You are braver than you believe stronger than you seem smarter than you think.', category: 'Perseverance' }
  ] },
  { day: 13, quotes: [
    { text: 'Most people give up just when they\'re about to achieve success.', category: 'Perseverance' },
    { text: 'Stars can\'t shine without darkness.', category: 'Perseverance' },
    { text: 'Keep planting. Keep watering. The harvest is coming.', category: 'Perseverance' },
    { text: 'Don\'t watch the clock. Do what it does. Keep going.', category: 'Perseverance' },
    { text: 'Champions keep playing until they get it right.', category: 'Perseverance' }
  ] },
  { day: 14, quotes: [
    { text: 'Patience and perseverance have a magical effect before which difficulties disappear.', category: 'Perseverance' },
    { text: 'The darkest hour has only sixty minutes.', category: 'Perseverance' },
    { text: 'Courage doesn\'t always roar. Sometimes it\'s the quiet voice saying I will try again tomorrow.', category: 'Perseverance' },
    { text: 'Push yourself because no one else is going to do it for you.', category: 'Perseverance' },
    { text: 'The human spirit is stronger than anything that can happen to it.', category: 'Perseverance' }
  ] },
  { day: 15, quotes: [
    { text: 'Endurance is not just bearing a hard thing but turning it into glory.', category: 'Perseverance' },
    { text: 'You were given this life because you are strong enough to live it.', category: 'Perseverance' },
    { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', category: 'Perseverance' },
    { text: 'One day you\'ll tell your story and it will become someone else\'s survival guide.', category: 'Perseverance' },
    { text: 'When everything seems against you remember airplanes take off against the wind.', category: 'Perseverance' }
  ] },
  { day: 16, quotes: [
    { text: 'Persistence can change failure into extraordinary achievement.', category: 'Perseverance' },
    { text: 'The oak fought the wind and was broken. The willow bent and survived.', category: 'Perseverance' },
    { text: 'Don\'t be discouraged. It\'s often the last key that opens the lock.', category: 'Perseverance' },
    { text: 'Not every day will be good. But there is good in every day.', category: 'Perseverance' },
    { text: 'Success is stumbling from failure to failure with no loss of enthusiasm.', category: 'Perseverance' }
  ] },
  { day: 17, quotes: [
    { text: 'Discipline is choosing between what you want now and what you want most.', category: 'Discipline' },
    { text: 'We are what we repeatedly do. Excellence is not an act but a habit.', category: 'Discipline' },
    { text: 'Motivation gets you started. Habit keeps you going.', category: 'Discipline' },
    { text: 'The secret of your success is found in your daily routine.', category: 'Discipline' },
    { text: 'You\'ll never change your life until you change something you do daily.', category: 'Discipline' }
  ] },
  { day: 18, quotes: [
    { text: 'Success isn\'t always about greatness. It\'s about consistency.', category: 'Discipline' },
    { text: 'Self-discipline is the bridge between goals and accomplishment.', category: 'Discipline' },
    { text: 'Don\'t break the chain. One day at a time.', category: 'Discipline' },
    { text: 'What you do every day matters more than what you do once in a while.', category: 'Discipline' },
    { text: 'Habits are the compound interest of self-improvement.', category: 'Discipline' }
  ] },
  { day: 19, quotes: [
    { text: 'The price of discipline is always less than the pain of regret.', category: 'Discipline' },
    { text: 'One percent better every day. That\'s 37 times better in a year.', category: 'Discipline' },
    { text: 'You don\'t rise to the level of your goals. You fall to the level of your systems.', category: 'Discipline' },
    { text: 'Nothing will work unless you do.', category: 'Discipline' },
    { text: 'Dripping water hollows out stone not through force but through persistence.', category: 'Discipline' }
  ] },
  { day: 20, quotes: [
    { text: 'Don\'t count the days. Make the days count.', category: 'Discipline' },
    { text: 'Start where you are. Use what you have. Do what you can.', category: 'Discipline' },
    { text: 'Don\'t wait for motivation. Create momentum.', category: 'Discipline' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', category: 'Discipline' },
    { text: 'Make each day your masterpiece.', category: 'Discipline' }
  ] },
  { day: 21, quotes: [
    { text: 'Drop by drop the bucket fills.', category: 'Discipline' },
    { text: 'The difference between who you are and who you want to be is what you do.', category: 'Discipline' },
    { text: 'First we form habits then they form us.', category: 'Discipline' },
    { text: 'Your daily choices are shaping your future right now.', category: 'Discipline' },
    { text: 'Routine is liberation. When habits are automatic willpower is free.', category: 'Discipline' }
  ] },
  { day: 22, quotes: [
    { text: 'The best way to predict your future is to create it.', category: 'Discipline' },
    { text: 'Discipline is remembering what you want.', category: 'Discipline' },
    { text: 'Little by little one travels far.', category: 'Discipline' },
    { text: 'An ounce of action is worth a ton of theory.', category: 'Discipline' },
    { text: 'Small disciplines repeated with consistency lead to great achievements.', category: 'Discipline' }
  ] },
  { day: 23, quotes: [
    { text: 'Do what is hard and your life will be easy.', category: 'Discipline' },
    { text: 'Automate the good. Eliminate the bad. That\'s the whole system.', category: 'Discipline' },
    { text: 'Energy and persistence conquer all things.', category: 'Discipline' },
    { text: 'Your habits are the architects of your destiny.', category: 'Discipline' },
    { text: 'Consistency is the true foundation of trust.', category: 'Discipline' }
  ] },
  { day: 24, quotes: [
    { text: 'The power of small wins cannot be overstated.', category: 'Discipline' },
    { text: 'Be patient with yourself. Self-growth is tender.', category: 'Discipline' },
    { text: 'What seems like overnight success is usually years of consistent work.', category: 'Discipline' },
    { text: 'When you master your habits you master your life.', category: 'Discipline' },
    { text: 'Repetition is the mother of learning and the architect of accomplishment.', category: 'Discipline' }
  ] },
  { day: 25, quotes: [
    { text: 'Whether you think you can or you think you can\'t you\'re right.', category: 'Mindset' },
    { text: 'Your mind is a garden. Your thoughts are the seeds.', category: 'Mindset' },
    { text: 'Change your thoughts and you change your world.', category: 'Mindset' },
    { text: 'Believe you can and you\'re halfway there.', category: 'Mindset' },
    { text: 'What you focus on expands. Focus on solutions.', category: 'Mindset' }
  ] },
  { day: 26, quotes: [
    { text: 'The mind is everything. What you think you become.', category: 'Mindset' },
    { text: 'Everything you\'ve ever wanted is on the other side of fear.', category: 'Mindset' },
    { text: 'Life is 10% what happens to you and 90% how you react to it.', category: 'Mindset' },
    { text: 'You are capable of more than you know.', category: 'Mindset' },
    { text: 'Doubt kills more dreams than failure ever will.', category: 'Mindset' }
  ] },
  { day: 27, quotes: [
    { text: 'The way you speak to yourself matters. Be kind.', category: 'Mindset' },
    { text: 'Don\'t let yesterday take up too much of today.', category: 'Mindset' },
    { text: 'Your life does not get better by chance. It gets better by change.', category: 'Mindset' },
    { text: 'Everything is figureoutable.', category: 'Mindset' },
    { text: 'You can\'t go back and change the beginning but you can start where you are.', category: 'Mindset' }
  ] },
  { day: 28, quotes: [
    { text: 'A calm mind brings inner strength and self-confidence.', category: 'Mindset' },
    { text: 'Impossible is just an opinion.', category: 'Mindset' },
    { text: 'The way to get started is to quit talking and begin doing.', category: 'Mindset' },
    { text: 'Challenges make life interesting. Overcoming them makes life meaningful.', category: 'Mindset' },
    { text: 'Be stubborn about your goals and flexible about your methods.', category: 'Mindset' }
  ] },
  { day: 29, quotes: [
    { text: 'Where focus goes energy flows.', category: 'Mindset' },
    { text: 'Strength comes from overcoming what you thought you couldn\'t.', category: 'Mindset' },
    { text: 'You are enough just as you are. And getting better every day.', category: 'Mindset' },
    { text: 'Stop being afraid of what could go wrong. Be excited about what could go right.', category: 'Mindset' },
    { text: 'Every morning you choose: sleep with dreams or wake up and chase them.', category: 'Mindset' }
  ] },
  { day: 30, quotes: [
    { text: 'Your attitude determines your direction.', category: 'Mindset' },
    { text: 'Don\'t limit your challenges. Challenge your limits.', category: 'Mindset' },
    { text: 'The only person you are destined to become is the person you decide to be.', category: 'Mindset' },
    { text: 'Worrying does not take away tomorrow\'s troubles. It takes away today\'s peace.', category: 'Mindset' },
    { text: 'Your potential is endless.', category: 'Mindset' }
  ] },
  { day: 31, quotes: [
    { text: 'Limitations live only in our minds.', category: 'Mindset' },
    { text: 'Our greatest glory is not in never falling but in rising every time we fall.', category: 'Mindset' },
    { text: 'What consumes your mind controls your life.', category: 'Mindset' },
    { text: 'Thinking will not overcome fear but action will.', category: 'Mindset' },
    { text: 'No one can make you feel inferior without your consent.', category: 'Mindset' }
  ] },
  { day: 32, quotes: [
    { text: 'The biggest risk is not taking any risk.', category: 'Mindset' },
    { text: 'You were born to be real not to be perfect.', category: 'Mindset' },
    { text: 'Your beliefs become your thoughts. Your thoughts become your actions.', category: 'Mindset' },
    { text: 'The greatest discovery is that you can change your future by changing your attitude.', category: 'Mindset' },
    { text: 'Positive thinking lets you do everything better than negative thinking will.', category: 'Mindset' }
  ] },
  { day: 33, quotes: [
    { text: 'A journey of a thousand miles begins with a single step.', category: 'Small Steps' },
    { text: 'Big things are built one small piece at a time.', category: 'Small Steps' },
    { text: 'Progress is progress no matter how small.', category: 'Small Steps' },
    { text: 'Every expert was once a beginner.', category: 'Small Steps' },
    { text: 'The only impossible journey is the one you never begin.', category: 'Small Steps' }
  ] },
  { day: 34, quotes: [
    { text: 'A year from now you\'ll wish you had started today.', category: 'Small Steps' },
    { text: 'Your future is created by what you do today not tomorrow.', category: 'Small Steps' },
    { text: 'Step by step. Day by day. Payment by payment.', category: 'Small Steps' },
    { text: 'Focus on the step in front of you not the whole staircase.', category: 'Small Steps' },
    { text: 'Small wins fuel big victories.', category: 'Small Steps' }
  ] },
  { day: 35, quotes: [
    { text: 'One step at a time is still walking.', category: 'Small Steps' },
    { text: 'The compound effect of tiny daily improvements is remarkable.', category: 'Small Steps' },
    { text: 'The secret of getting ahead is getting started.', category: 'Small Steps' },
    { text: 'Do something today that your future self will thank you for.', category: 'Small Steps' },
    { text: 'Think big start small act now.', category: 'Small Steps' }
  ] },
  { day: 36, quotes: [
    { text: 'Every accomplishment starts with the decision to try.', category: 'Small Steps' },
    { text: 'Begin wherever you are and start taking action.', category: 'Small Steps' },
    { text: 'An ant can carry fifty times its own weight. You can carry more than you think.', category: 'Small Steps' },
    { text: 'Great things are done by a series of small things brought together.', category: 'Small Steps' },
    { text: 'You are making progress even on the days it doesn\'t feel like it.', category: 'Small Steps' }
  ] },
  { day: 37, quotes: [
    { text: 'Not all steps forward are big. But they all move you closer.', category: 'Small Steps' },
    { text: 'Movement in any direction is better than standing still.', category: 'Small Steps' },
    { text: 'The beginning is always today.', category: 'Small Steps' },
    { text: 'Little strokes fell great oaks.', category: 'Small Steps' },
    { text: 'The man who moves a mountain begins by carrying away small stones.', category: 'Small Steps' }
  ] },
  { day: 38, quotes: [
    { text: 'You don\'t have to be extreme. Just consistent.', category: 'Small Steps' },
    { text: 'Inch by inch anything\'s a cinch.', category: 'Small Steps' },
    { text: 'Steady progress is better than sudden perfection.', category: 'Small Steps' },
    { text: 'Don\'t overwhelm yourself with the big picture. Focus on the next right step.', category: 'Small Steps' },
    { text: 'Ten minutes of action beats ten hours of planning.', category: 'Small Steps' }
  ] },
  { day: 39, quotes: [
    { text: 'Never underestimate the power of small beginnings.', category: 'Small Steps' },
    { text: 'Take it one day at a time. That\'s all anyone can do.', category: 'Small Steps' },
    { text: 'What you do today is important because you\'re exchanging a day of your life for it.', category: 'Small Steps' },
    { text: 'The shortest way to do many things is to do one thing at a time.', category: 'Small Steps' },
    { text: 'Tomorrow becomes never. Take the first step now.', category: 'Small Steps' }
  ] },
  { day: 40, quotes: [
    { text: 'Plant seeds of effort today; harvest success tomorrow.', category: 'Small Steps' },
    { text: 'You eat an elephant one bite at a time.', category: 'Small Steps' },
    { text: 'Success is a series of small wins stacked on top of each other.', category: 'Small Steps' },
    { text: 'Don\'t wait for the perfect moment. Take the moment and make it perfect.', category: 'Small Steps' },
    { text: 'A small positive step is better than a large step in no direction.', category: 'Small Steps' }
  ] },
  { day: 41, quotes: [
    { text: 'Patience is not the ability to wait but to keep a good attitude while waiting.', category: 'Patience' },
    { text: 'Trust the process. Results come to those who earn them.', category: 'Patience' },
    { text: 'Nature does not hurry yet everything is accomplished.', category: 'Patience' },
    { text: 'Slow and steady wins the race.', category: 'Patience' },
    { text: 'Don\'t rush the process. Good things take time.', category: 'Patience' }
  ] },
  { day: 42, quotes: [
    { text: 'Patience is bitter but its fruit is sweet.', category: 'Patience' },
    { text: 'Your time is coming. Just keep doing the work.', category: 'Patience' },
    { text: 'Growth is silent. You won\'t hear it but you\'ll feel it.', category: 'Patience' },
    { text: 'Rest if you must but don\'t quit.', category: 'Patience' },
    { text: 'Success is a marathon not a sprint.', category: 'Patience' }
  ] },
  { day: 43, quotes: [
    { text: 'Seeds don\'t become trees overnight.', category: 'Patience' },
    { text: 'The oak tree was once a little nut that held its ground.', category: 'Patience' },
    { text: 'Progress takes patience. Give yourself grace.', category: 'Patience' },
    { text: 'Delays are not denials.', category: 'Patience' },
    { text: 'What feels slow now is building something that will last.', category: 'Patience' }
  ] },
  { day: 44, quotes: [
    { text: 'Trust the wait. Embrace the uncertainty.', category: 'Patience' },
    { text: 'Even flowers need time to bloom.', category: 'Patience' },
    { text: 'Patience is the companion of wisdom.', category: 'Patience' },
    { text: 'Adopt the pace of nature: her secret is patience.', category: 'Patience' },
    { text: 'All in good time. Just keep showing up.', category: 'Patience' }
  ] },
  { day: 45, quotes: [
    { text: 'Everything is hard before it is easy.', category: 'Patience' },
    { text: 'Things work out best for those who make the best of how things work out.', category: 'Patience' },
    { text: 'Have faith in the timing of your life.', category: 'Patience' },
    { text: 'You are right on time.', category: 'Patience' },
    { text: 'The longer the wait the sweeter the reward.', category: 'Patience' }
  ] },
  { day: 46, quotes: [
    { text: 'Be patient. Everything comes to you in the right moment.', category: 'Patience' },
    { text: 'Great works are performed not by strength but by perseverance.', category: 'Patience' },
    { text: 'Have patience. All things are difficult before they become easy.', category: 'Patience' },
    { text: 'Where you are is not who you are.', category: 'Patience' },
    { text: 'Believe in the power of yet. You\'re not there yet.', category: 'Patience' }
  ] },
  { day: 47, quotes: [
    { text: 'You are worth more than the sum of your debts.', category: 'Self-Worth' },
    { text: 'Your net worth is not your self-worth.', category: 'Self-Worth' },
    { text: 'You deserve financial peace. Not someday. Now.', category: 'Self-Worth' },
    { text: 'Be proud of how hard you are trying.', category: 'Self-Worth' },
    { text: 'You are not your mistakes. You are the lessons you learn from them.', category: 'Self-Worth' }
  ] },
  { day: 48, quotes: [
    { text: 'Speak to yourself like someone you love.', category: 'Self-Worth' },
    { text: 'You are allowed to be both a masterpiece and a work in progress.', category: 'Self-Worth' },
    { text: 'Investing in yourself is the best investment you will ever make.', category: 'Self-Worth' },
    { text: 'Stop shrinking to fit places you\'ve outgrown.', category: 'Self-Worth' },
    { text: 'Confidence comes from keeping the promises you make to yourself.', category: 'Self-Worth' }
  ] },
  { day: 49, quotes: [
    { text: 'You have survived 100% of your worst days.', category: 'Self-Worth' },
    { text: 'You are the only person who gets to decide what you are worth.', category: 'Self-Worth' },
    { text: 'You already have everything you need to begin.', category: 'Self-Worth' },
    { text: 'Self-care is not selfish. It\'s essential.', category: 'Self-Worth' },
    { text: 'You are the CEO of your life. Start making executive decisions.', category: 'Self-Worth' }
  ] },
  { day: 50, quotes: [
    { text: 'Be gentle with yourself. You\'re doing the best you can.', category: 'Self-Worth' },
    { text: 'What makes you different makes you strong.', category: 'Self-Worth' },
    { text: 'Love yourself enough to set boundaries.', category: 'Self-Worth' },
    { text: 'The most powerful relationship you will ever have is with yourself.', category: 'Self-Worth' },
    { text: 'You didn\'t come this far to be average.', category: 'Self-Worth' }
  ] },
  { day: 51, quotes: [
    { text: 'Owning our story is the bravest thing we\'ll ever do.', category: 'Self-Worth' },
    { text: 'You were not born to just pay bills and die.', category: 'Self-Worth' },
    { text: 'You are one decision away from a completely different life.', category: 'Self-Worth' },
    { text: 'Be so good they can\'t ignore you.', category: 'Self-Worth' },
    { text: 'The world needs who you were made to be.', category: 'Self-Worth' }
  ] },
  { day: 52, quotes: [
    { text: 'Vulnerability is not weakness. It\'s our greatest measure of courage.', category: 'Self-Worth' },
    { text: 'Don\'t let the noise of others\' opinions drown out your inner voice.', category: 'Self-Worth' },
    { text: 'You can\'t pour from an empty cup. Take care of yourself first.', category: 'Self-Worth' },
    { text: 'Stop apologizing for who you are becoming.', category: 'Self-Worth' },
    { text: 'Nobody is going to hit a home run for you. Step up to the plate.', category: 'Self-Worth' }
  ] },
  { day: 53, quotes: [
    { text: 'Gratitude turns what we have into enough.', category: 'Gratitude' },
    { text: 'Be thankful for what you have. You\'ll end up having more.', category: 'Gratitude' },
    { text: 'When you focus on the good the good gets better.', category: 'Gratitude' },
    { text: 'There is always something to be grateful for.', category: 'Gratitude' },
    { text: 'Wake up with determination. Go to bed with satisfaction.', category: 'Gratitude' }
  ] },
  { day: 54, quotes: [
    { text: 'Trade your expectation for appreciation and the world changes.', category: 'Gratitude' },
    { text: 'Appreciate where you are in your journey even if it\'s not where you want to be.', category: 'Gratitude' },
    { text: 'Enjoy the little things. One day you\'ll realize they were the big things.', category: 'Gratitude' },
    { text: 'Today is a good day to have a good day.', category: 'Gratitude' },
    { text: 'Focus on how far you\'ve come not how far you have to go.', category: 'Gratitude' }
  ] },
  { day: 55, quotes: [
    { text: 'Every sunset is an opportunity to reset.', category: 'Gratitude' },
    { text: 'Find joy in the ordinary.', category: 'Gratitude' },
    { text: 'Every day may not be good but there is something good in every day.', category: 'Gratitude' },
    { text: 'Comparison is the thief of joy. Run your own race.', category: 'Gratitude' },
    { text: 'Your struggle is part of your story.', category: 'Gratitude' }
  ] },
  { day: 56, quotes: [
    { text: 'Not all storms come to disrupt your life. Some clear your path.', category: 'Gratitude' },
    { text: 'Perspective is everything.', category: 'Gratitude' },
    { text: 'Happiness is not something ready-made. It comes from your own actions.', category: 'Gratitude' },
    { text: 'Don\'t let things you can\'t control steal your joy.', category: 'Gratitude' },
    { text: 'When you can\'t find the sunshine be the sunshine.', category: 'Gratitude' }
  ] },
  { day: 57, quotes: [
    { text: 'You\'ve already overcome so much. Don\'t forget to celebrate that.', category: 'Gratitude' },
    { text: 'The happiest people make the best of everything.', category: 'Gratitude' },
    { text: 'Count your blessings not your problems.', category: 'Gratitude' },
    { text: 'What if you woke up today with only what you were grateful for yesterday?', category: 'Gratitude' },
    { text: 'Be grateful for every closed door. They guide you to the right one.', category: 'Gratitude' }
  ] },
  { day: 58, quotes: [
    { text: 'Joy is not in things. It is in us.', category: 'Gratitude' },
    { text: 'The real gift of gratitude is that the more grateful you are the more present you become.', category: 'Gratitude' },
    { text: 'Some days you just have to create your own sunshine.', category: 'Gratitude' },
    { text: 'Today\'s tears water tomorrow\'s gardens.', category: 'Gratitude' },
    { text: 'It\'s a beautiful day to be alive.', category: 'Gratitude' }
  ] },
  { day: 59, quotes: [
    { text: 'Every day is a fresh start. Breathe and begin again.', category: 'Fresh Starts' },
    { text: 'Today is the first day of the rest of your life.', category: 'Fresh Starts' },
    { text: 'New beginnings are often disguised as painful endings.', category: 'Fresh Starts' },
    { text: 'Hope is being able to see light despite all the darkness.', category: 'Fresh Starts' },
    { text: 'Tomorrow is another chance to get it right.', category: 'Fresh Starts' }
  ] },
  { day: 60, quotes: [
    { text: 'You can\'t start the next chapter if you keep re-reading the last one.', category: 'Fresh Starts' },
    { text: 'No matter how hard the past you can always begin again.', category: 'Fresh Starts' },
    { text: 'The sun will rise and we will try again.', category: 'Fresh Starts' },
    { text: 'It\'s never too late to become what you might have been.', category: 'Fresh Starts' },
    { text: 'Rock bottom became the solid foundation on which I rebuilt my life.', category: 'Fresh Starts' }
  ] },
  { day: 61, quotes: [
    { text: 'There are far better things ahead than any we leave behind.', category: 'Fresh Starts' },
    { text: 'Today you are one step closer to the life you want.', category: 'Fresh Starts' },
    { text: 'Even the darkest night will end and the sun will rise.', category: 'Fresh Starts' },
    { text: 'The comeback is always stronger than the setback.', category: 'Fresh Starts' },
    { text: 'Let go of what was. Welcome what is.', category: 'Fresh Starts' }
  ] },
  { day: 62, quotes: [
    { text: 'Don\'t look back. You\'re not going that way.', category: 'Fresh Starts' },
    { text: 'The beautiful thing about a new day is the slate is clean.', category: 'Fresh Starts' },
    { text: 'Failure is simply the opportunity to begin again more intelligently.', category: 'Fresh Starts' },
    { text: 'If plan A doesn\'t work the alphabet has 25 more letters.', category: 'Fresh Starts' },
    { text: 'You are never too old to set another goal or dream a new dream.', category: 'Fresh Starts' }
  ] },
  { day: 63, quotes: [
    { text: 'Keep your face always toward the sunshine and shadows will fall behind you.', category: 'Fresh Starts' },
    { text: 'Rise above the storm and you will find the sunshine.', category: 'Fresh Starts' },
    { text: 'Mistakes are proof that you are trying.', category: 'Fresh Starts' },
    { text: 'Create the life you can\'t wait to wake up to.', category: 'Fresh Starts' },
    { text: 'A flower does not compete with the flower next to it. It just blooms.', category: 'Fresh Starts' }
  ] },
  { day: 64, quotes: [
    { text: 'And so the adventure begins.', category: 'Fresh Starts' },
    { text: 'After a storm comes a calm.', category: 'Fresh Starts' },
    { text: 'Every ending is a new beginning.', category: 'Fresh Starts' },
    { text: 'Your life isn\'t behind you. It\'s always in front of you.', category: 'Fresh Starts' },
    { text: 'Wake up every morning thinking something wonderful is about to happen.', category: 'Fresh Starts' }
  ] },
  { day: 65, quotes: [
    { text: 'Life doesn\'t get easier. You get stronger.', category: 'Strength' },
    { text: 'A smooth sea never made a skilled sailor.', category: 'Strength' },
    { text: 'What does not kill us makes us stronger.', category: 'Strength' },
    { text: 'The world breaks everyone and afterward many are strong at the broken places.', category: 'Strength' },
    { text: 'Be like water. It can cut through rock.', category: 'Strength' }
  ] },
  { day: 66, quotes: [
    { text: 'I am not what happened to me. I am what I choose to become.', category: 'Strength' },
    { text: 'Turn your wounds into wisdom.', category: 'Strength' },
    { text: 'Life is tough but so are you.', category: 'Strength' },
    { text: 'A diamond is a chunk of coal that did well under pressure.', category: 'Strength' },
    { text: 'Strength grows in the moments you think you can\'t go on but keep going.', category: 'Strength' }
  ] },
  { day: 67, quotes: [
    { text: 'Pain is temporary. Quitting lasts forever.', category: 'Strength' },
    { text: 'Broken crayons still color.', category: 'Strength' },
    { text: 'You don\'t know how strong you are until being strong is your only choice.', category: 'Strength' },
    { text: 'In the middle of difficulty lies opportunity.', category: 'Strength' },
    { text: 'Tough times don\'t last. Tough people do.', category: 'Strength' }
  ] },
  { day: 68, quotes: [
    { text: 'You are the sky. Everything else is just the weather.', category: 'Strength' },
    { text: 'Steel is forged in fire. Diamonds are made under pressure. So are you.', category: 'Strength' },
    { text: 'I can be changed by what happens to me. But I refuse to be reduced by it.', category: 'Strength' },
    { text: 'Don\'t pray for an easy life. Pray for the strength to endure a difficult one.', category: 'Strength' },
    { text: 'Your hardest times often lead to the greatest moments of your life.', category: 'Strength' }
  ] },
  { day: 69, quotes: [
    { text: 'Where there is no struggle there is no strength.', category: 'Strength' },
    { text: 'Not everything that is faced can be changed but nothing can be changed until it is faced.', category: 'Strength' },
    { text: 'Difficulties in life are intended to make us better not bitter.', category: 'Strength' },
    { text: 'A hero is an ordinary individual who finds the strength to persevere.', category: 'Strength' },
    { text: 'Sometimes you have to get knocked down lower to stand up taller.', category: 'Strength' }
  ] },
  { day: 70, quotes: [
    { text: 'We develop courage by surviving difficult times.', category: 'Strength' },
    { text: 'When the going gets tough the tough get going.', category: 'Strength' },
    { text: 'You may have to fight a battle more than once to win it.', category: 'Strength' },
    { text: 'Scars are just tattoos with better stories.', category: 'Strength' },
    { text: 'You can\'t calm the storm. What you can do is calm yourself.', category: 'Strength' }
  ] },
  { day: 71, quotes: [
    { text: 'You are not your debt. You are the person brave enough to face it.', category: 'Debt Motivation' },
    { text: 'Every dollar toward your balance is a vote for the life you want.', category: 'Debt Motivation' },
    { text: 'Dex says: one payment at a time one day at a time one win at a time.', category: 'Debt Motivation' },
    { text: 'That feeling when your balance is lower than last month? That\'s momentum.', category: 'Debt Motivation' },
    { text: 'Debt doesn\'t define your story. How you handle it does.', category: 'Debt Motivation' }
  ] },
  { day: 72, quotes: [
    { text: 'Today you are closer to zero than you\'ve ever been.', category: 'Debt Motivation' },
    { text: 'Payoff day is coming. Every payment brings it closer.', category: 'Debt Motivation' },
    { text: 'You chose to face this. That already makes you braver than most.', category: 'Debt Motivation' },
    { text: 'Small payments end big debts.', category: 'Debt Motivation' },
    { text: 'Your credit cards don\'t own you. You own your future.', category: 'Debt Motivation' }
  ] },
  { day: 73, quotes: [
    { text: 'The best revenge against debt is a boring consistent payment plan.', category: 'Debt Motivation' },
    { text: 'You\'re playing the long game. Long games always win.', category: 'Debt Motivation' },
    { text: 'Debt payoff is not exciting. It\'s empowering.', category: 'Debt Motivation' },
    { text: 'One less bill. One more breath of freedom.', category: 'Debt Motivation' },
    { text: 'The only bad payment is the one you didn\'t make.', category: 'Debt Motivation' }
  ] },
  { day: 74, quotes: [
    { text: 'Celebrate every milestone. Every hundred dollars paid off matters.', category: 'Debt Motivation' },
    { text: 'This month\'s sacrifice is next year\'s freedom.', category: 'Debt Motivation' },
    { text: 'Financial freedom starts the moment you decide to fight for it.', category: 'Debt Motivation' },
    { text: 'Debt is a chapter not the whole book.', category: 'Debt Motivation' },
    { text: 'The balance goes down. The confidence goes up.', category: 'Debt Motivation' }
  ] },
  { day: 75, quotes: [
    { text: 'Making a payment when money is tight isn\'t easy. It\'s heroic.', category: 'Debt Motivation' },
    { text: 'You\'re doing something most people avoid. That takes guts.', category: 'Debt Motivation' },
    { text: 'Look how far you\'ve come. Now imagine six months from now.', category: 'Debt Motivation' },
    { text: 'Your payoff date isn\'t a dream. It\'s a deadline.', category: 'Debt Motivation' },
    { text: 'Every time you say no to what you can\'t afford you say yes to something bigger.', category: 'Debt Motivation' }
  ] },
  { day: 76, quotes: [
    { text: 'Even on the hard days the balance went down. That counts.', category: 'Debt Motivation' },
    { text: 'One day this will all be a memory. A proud one.', category: 'Debt Motivation' },
    { text: 'You started. That\'s the hardest part. Now just don\'t stop.', category: 'Debt Motivation' },
    { text: 'The spreadsheet doesn\'t lie. You\'re winning.', category: 'Debt Motivation' },
    { text: 'Dex is rooting for you. And so is your future self.', category: 'Debt Motivation' }
  ] },
  { day: 77, quotes: [
    { text: 'You will tell this story someday. Make the ending great.', category: 'Debt Motivation' },
    { text: 'A debt-free life is built in the boring middle. Keep building.', category: 'Debt Motivation' },
    { text: 'Interest is the price of impatience. Patience is your superpower now.', category: 'Debt Motivation' },
    { text: 'You are literally buying your freedom back one payment at a time.', category: 'Debt Motivation' },
    { text: 'When in doubt make a payment.', category: 'Debt Motivation' }
  ] },
  { day: 78, quotes: [
    { text: 'Debt is temporary. The character you build paying it off is permanent.', category: 'Debt Motivation' },
    { text: 'Right now someone with half your income is debt-free because they decided to be.', category: 'Debt Motivation' },
    { text: 'Snowball or avalanche - pick a method and start rolling.', category: 'Debt Motivation' },
    { text: 'There is no pride in being in debt. There is massive pride in getting out.', category: 'Debt Motivation' },
    { text: 'The first rule of getting out of a hole is to stop digging.', category: 'Debt Motivation' }
  ] },
  { day: 79, quotes: [
    { text: 'Live like no one else now so later you can live like no one else.', category: 'Debt Motivation' },
    { text: 'Net worth is built in the boring months. Keep being boring.', category: 'Debt Motivation' },
    { text: 'Your future isn\'t written in your debt balance. It\'s written in your daily decisions.', category: 'Debt Motivation' },
    { text: 'Be weird. Be the person who actually follows a budget.', category: 'Debt Motivation' },
    { text: 'Frugal isn\'t cheap. Frugal is free.', category: 'Debt Motivation' }
  ] },
  { day: 80, quotes: [
    { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', category: 'Action' },
    { text: 'Well done is better than well said.', category: 'Action' },
    { text: 'Stop wishing. Start doing.', category: 'Action' },
    { text: 'You miss 100% of the shots you don\'t take.', category: 'Action' },
    { text: 'Fortune favors the bold.', category: 'Action' }
  ] },
  { day: 81, quotes: [
    { text: 'Get started. The rest will follow.', category: 'Action' },
    { text: 'Do it now. Sometimes later becomes never.', category: 'Action' },
    { text: 'You are what you do not what you say you\'ll do.', category: 'Action' },
    { text: 'Be the hero of your own life.', category: 'Action' },
    { text: 'The path to success is to take massive determined action.', category: 'Action' }
  ] },
  { day: 82, quotes: [
    { text: 'Don\'t wait for opportunity. Create it.', category: 'Action' },
    { text: 'Life rewards those who take action.', category: 'Action' },
    { text: 'Dream it. Believe it. Build it.', category: 'Action' },
    { text: 'Don\'t stop until you\'re proud.', category: 'Action' },
    { text: 'Go the extra mile. It\'s never crowded.', category: 'Action' }
  ] },
  { day: 83, quotes: [
    { text: 'Hard work beats talent when talent doesn\'t work hard.', category: 'Action' },
    { text: 'Opportunities don\'t happen. You create them.', category: 'Action' },
    { text: 'Stay hungry. Stay foolish.', category: 'Action' },
    { text: 'The difference between ordinary and extraordinary is that little extra.', category: 'Action' },
    { text: 'Turn your can\'ts into cans and your dreams into plans.', category: 'Action' }
  ] },
  { day: 84, quotes: [
    { text: 'If it doesn\'t challenge you it doesn\'t change you.', category: 'Action' },
    { text: 'Every champion was once a contender who refused to give up.', category: 'Action' },
    { text: 'Winners are not people who never fail. They are people who never quit.', category: 'Action' },
    { text: 'The harder you work the greater you\'ll feel when you achieve it.', category: 'Action' },
    { text: 'Hustle until you no longer have to introduce yourself.', category: 'Action' }
  ] },
  { day: 85, quotes: [
    { text: 'It\'s going to be hard but hard does not mean impossible.', category: 'Action' },
    { text: 'If you want something you\'ve never had be willing to do what you\'ve never done.', category: 'Action' },
    { text: 'Procrastination is the art of keeping up with yesterday.', category: 'Action' },
    { text: 'Knowledge is of no value unless you put it into practice.', category: 'Action' },
    { text: 'People who say it cannot be done should not interrupt those doing it.', category: 'Action' }
  ] },
  { day: 86, quotes: [
    { text: 'Peace is not the absence of trouble but the presence of calm.', category: 'Peace' },
    { text: 'Almost everything will work again if you unplug it for a few minutes. Including you.', category: 'Peace' },
    { text: 'The greatest wealth is health.', category: 'Peace' },
    { text: 'Rest when you\'re weary. Refresh yourself. Then get back to work.', category: 'Peace' },
    { text: 'Your calm mind is the ultimate weapon against your challenges.', category: 'Peace' }
  ] },
  { day: 87, quotes: [
    { text: 'You owe yourself the love that you so freely give to other people.', category: 'Peace' },
    { text: 'Self-care is how you take your power back.', category: 'Peace' },
    { text: 'Be where you are not where you think you should be.', category: 'Peace' },
    { text: 'Breathe. Let go. This moment is all you have for sure.', category: 'Peace' },
    { text: 'Taking time to do nothing often brings everything into perspective.', category: 'Peace' }
  ] },
  { day: 88, quotes: [
    { text: 'Don\'t trade your peace for a paycheck. Find a way to have both.', category: 'Peace' },
    { text: 'Healing is not linear.', category: 'Peace' },
    { text: 'Happiness is an inside job.', category: 'Peace' },
    { text: 'Inner peace begins when you stop letting others control your emotions.', category: 'Peace' },
    { text: 'Serenity is not freedom from the storm but peace amid the storm.', category: 'Peace' }
  ] },
  { day: 89, quotes: [
    { text: 'You are not a machine. Rest is not a reward. It is a requirement.', category: 'Peace' },
    { text: 'The greatest gift you can give yourself is a little of your own attention.', category: 'Peace' },
    { text: 'Mental health is a process not a destination.', category: 'Peace' },
    { text: 'Don\'t let anxiety steal today because of what might happen tomorrow.', category: 'Peace' },
    { text: 'Sometimes the most productive thing you can do is relax.', category: 'Peace' }
  ] },
  { day: 90, quotes: [
    { text: 'You only live once but if you do it right once is enough.', category: 'Inspiration' },
    { text: 'Try to be a rainbow in someone\'s cloud.', category: 'Inspiration' },
    { text: 'Whatever you are be a good one.', category: 'Inspiration' },
    { text: 'When the world says give up hope whispers try one more time.', category: 'Inspiration' },
    { text: 'Be kind whenever possible. It is always possible.', category: 'Inspiration' }
  ] },
  { day: 91, quotes: [
    { text: 'It is during our darkest moments that we must focus to see the light.', category: 'Inspiration' },
    { text: 'You always pass failure on the way to success.', category: 'Inspiration' },
    { text: 'In a gentle way you can shake the world.', category: 'Inspiration' },
    { text: 'Everything will be okay in the end. If it\'s not okay it\'s not the end.', category: 'Inspiration' },
    { text: 'Stay close to people who feel like sunshine.', category: 'Inspiration' }
  ] },
  { day: 92, quotes: [
    { text: 'Not all who wander are lost.', category: 'Inspiration' },
    { text: 'No rain no flowers.', category: 'Inspiration' },
    { text: 'And still I rise.', category: 'Inspiration' },
    { text: 'Be the energy you want to attract.', category: 'Inspiration' },
    { text: 'The best is yet to come.', category: 'Inspiration' }
  ] },
  { day: 93, quotes: [
    { text: 'Work hard in silence. Let your success be your noise.', category: 'Inspiration' },
    { text: 'She believed she could so she did.', category: 'Inspiration' },
    { text: 'Prove them wrong.', category: 'Inspiration' },
    { text: 'Bloom where you are planted.', category: 'Inspiration' },
    { text: 'Life is either a daring adventure or nothing at all.', category: 'Inspiration' }
  ] },
  { day: 94, quotes: [
    { text: 'Act as if what you do makes a difference. It does.', category: 'Inspiration' },
    { text: 'Every moment is a fresh beginning.', category: 'Inspiration' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', category: 'Inspiration' },
    { text: 'Keep smiling because life is a beautiful thing.', category: 'Inspiration' },
    { text: 'Life is a balance of holding on and letting go.', category: 'Inspiration' }
  ] },
  { day: 95, quotes: [
    { text: 'Every dollar you put toward debt is a dollar invested in your freedom.', category: 'Financial Freedom' },
    { text: 'Debt is the thief of tomorrow\'s choices. Take them back today.', category: 'Financial Freedom' },
    { text: 'Financial freedom isn\'t about being rich. It\'s about having options.', category: 'Financial Freedom' },
    { text: 'The best time to start paying off debt was years ago. The second best is now.', category: 'Financial Freedom' },
    { text: 'You don\'t need a perfect plan. You need a first payment.', category: 'Financial Freedom' }
  ] },
  { day: 96, quotes: [
    { text: 'Money problems are temporary. The habits you build solving them are permanent.', category: 'Financial Freedom' },
    { text: 'Every debt you pay off is a chain you break.', category: 'Financial Freedom' },
    { text: 'Being debt-free isn\'t a destination. It\'s how you travel through life.', category: 'Financial Freedom' },
    { text: 'Wealth isn\'t what you earn. It\'s what you keep after bills are paid.', category: 'Financial Freedom' },
    { text: 'A budget isn\'t a punishment. It\'s permission to spend without guilt.', category: 'Financial Freedom' }
  ] },
  { day: 97, quotes: [
    { text: 'You are not your credit score. But improving it feels great.', category: 'Financial Freedom' },
    { text: 'The interest you\'re not paying is the raise you gave yourself.', category: 'Financial Freedom' },
    { text: 'Financial peace is worth more than anything you could buy on credit.', category: 'Financial Freedom' },
    { text: 'Stop paying for yesterday. Start investing in tomorrow.', category: 'Financial Freedom' },
    { text: 'Every paycheck is a fresh chance to change your financial future.', category: 'Financial Freedom' }
  ] },
  { day: 98, quotes: [
    { text: 'You didn\'t get into debt overnight. You won\'t get out overnight. But you will.', category: 'Financial Freedom' },
    { text: 'The road to financial freedom is paved with boring consistent payments.', category: 'Financial Freedom' },
    { text: 'Your future self will thank you for every sacrifice you make today.', category: 'Financial Freedom' },
    { text: 'Debt is a promise to your past. Freedom is a promise to your future.', category: 'Financial Freedom' },
    { text: 'When you owe nothing everything you earn is yours.', category: 'Financial Freedom' }
  ] },
  { day: 99, quotes: [
    { text: 'A debt-free life isn\'t about deprivation. It\'s about liberation.', category: 'Financial Freedom' },
    { text: 'You\'re not behind. You\'re exactly where your comeback starts.', category: 'Financial Freedom' },
    { text: 'The freedom you want is on the other side of the payments you\'re making.', category: 'Financial Freedom' },
    { text: 'The sacrifice is temporary. The freedom is permanent.', category: 'Financial Freedom' },
    { text: 'Compound interest works against you in debt. Make it work for you in savings.', category: 'Financial Freedom' }
  ] },
  { day: 100, quotes: [
    { text: 'Money is a tool. Debt is a trap. Freedom is the goal.', category: 'Financial Freedom' },
    { text: 'Live below your means today so you can live beyond them tomorrow.', category: 'Financial Freedom' },
    { text: 'The goal isn\'t to be rich. It\'s to be free.', category: 'Financial Freedom' },
    { text: 'Imagine waking up owing nothing. That morning is coming.', category: 'Financial Freedom' },
    { text: 'Broke is temporary. Poor is a mindset. You\'re choosing neither.', category: 'Financial Freedom' }
  ] },
  { day: 101, quotes: [
    { text: 'The best investment you\'ll ever make is paying off what you owe.', category: 'Financial Freedom' },
    { text: 'Every payment is proof that you chose your future over your past.', category: 'Financial Freedom' },
    { text: 'You are closer to debt-free today than you were yesterday.', category: 'Financial Freedom' },
    { text: 'Budgeting is telling your money where to go instead of wondering where it went.', category: 'Financial Freedom' },
    { text: 'The gap between your income and your spending is where freedom lives.', category: 'Financial Freedom' }
  ] },
  { day: 102, quotes: [
    { text: 'Your financial story isn\'t over. This is just the plot twist.', category: 'Financial Freedom' },
    { text: 'Don\'t compare your chapter one to someone else\'s chapter twenty.', category: 'Financial Freedom' },
    { text: 'Financial freedom is the ultimate form of self-care.', category: 'Financial Freedom' },
    { text: 'Money doesn\'t buy happiness but being free from debt buys peace.', category: 'Financial Freedom' },
    { text: 'There\'s no shame in having debt. There\'s power in deciding to end it.', category: 'Financial Freedom' }
  ] },
  { day: 103, quotes: [
    { text: 'Fall seven times stand up eight.', category: 'Perseverance' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', category: 'Perseverance' },
    { text: 'The only way out is through. Keep going.', category: 'Perseverance' },
    { text: 'Success is not final failure is not fatal: it is the courage to continue that counts.', category: 'Perseverance' },
    { text: 'A river cuts through rock not by power but by persistence.', category: 'Perseverance' }
  ] },
  { day: 104, quotes: [
    { text: 'You haven\'t come this far to only come this far.', category: 'Perseverance' },
    { text: 'Difficult roads often lead to beautiful destinations.', category: 'Perseverance' },
    { text: 'When you feel like quitting remember why you started.', category: 'Perseverance' },
    { text: 'The struggle you\'re in today is developing the strength you need for tomorrow.', category: 'Perseverance' },
    { text: 'Every setback is a setup for a comeback.', category: 'Perseverance' }
  ] },
  { day: 105, quotes: [
    { text: 'The moment you\'re ready to quit is usually right before a breakthrough.', category: 'Perseverance' },
    { text: 'Progress not perfection is what matters.', category: 'Perseverance' },
    { text: 'It always seems impossible until it\'s done.', category: 'Perseverance' },
    { text: 'If you\'re going through hell keep going.', category: 'Perseverance' },
    { text: 'The pain you feel today will be the strength you feel tomorrow.', category: 'Perseverance' }
  ] },
  { day: 106, quotes: [
    { text: 'Tough times never last but tough people do.', category: 'Perseverance' },
    { text: 'Small progress is still progress.', category: 'Perseverance' },
    { text: 'Storms make trees take deeper roots.', category: 'Perseverance' },
    { text: 'Your current situation is not your final destination.', category: 'Perseverance' },
    { text: 'You are braver than you believe stronger than you seem smarter than you think.', category: 'Perseverance' }
  ] },
  { day: 107, quotes: [
    { text: 'Most people give up just when they\'re about to achieve success.', category: 'Perseverance' },
    { text: 'Stars can\'t shine without darkness.', category: 'Perseverance' },
    { text: 'Keep planting. Keep watering. The harvest is coming.', category: 'Perseverance' },
    { text: 'Don\'t watch the clock. Do what it does. Keep going.', category: 'Perseverance' },
    { text: 'Champions keep playing until they get it right.', category: 'Perseverance' }
  ] },
  { day: 108, quotes: [
    { text: 'Patience and perseverance have a magical effect before which difficulties disappear.', category: 'Perseverance' },
    { text: 'The darkest hour has only sixty minutes.', category: 'Perseverance' },
    { text: 'Courage doesn\'t always roar. Sometimes it\'s the quiet voice saying I will try again tomorrow.', category: 'Perseverance' },
    { text: 'Push yourself because no one else is going to do it for you.', category: 'Perseverance' },
    { text: 'The human spirit is stronger than anything that can happen to it.', category: 'Perseverance' }
  ] },
  { day: 109, quotes: [
    { text: 'Endurance is not just bearing a hard thing but turning it into glory.', category: 'Perseverance' },
    { text: 'You were given this life because you are strong enough to live it.', category: 'Perseverance' },
    { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', category: 'Perseverance' },
    { text: 'One day you\'ll tell your story and it will become someone else\'s survival guide.', category: 'Perseverance' },
    { text: 'When everything seems against you remember airplanes take off against the wind.', category: 'Perseverance' }
  ] },
  { day: 110, quotes: [
    { text: 'Persistence can change failure into extraordinary achievement.', category: 'Perseverance' },
    { text: 'The oak fought the wind and was broken. The willow bent and survived.', category: 'Perseverance' },
    { text: 'Don\'t be discouraged. It\'s often the last key that opens the lock.', category: 'Perseverance' },
    { text: 'Not every day will be good. But there is good in every day.', category: 'Perseverance' },
    { text: 'Success is stumbling from failure to failure with no loss of enthusiasm.', category: 'Perseverance' }
  ] },
  { day: 111, quotes: [
    { text: 'Discipline is choosing between what you want now and what you want most.', category: 'Discipline' },
    { text: 'We are what we repeatedly do. Excellence is not an act but a habit.', category: 'Discipline' },
    { text: 'Motivation gets you started. Habit keeps you going.', category: 'Discipline' },
    { text: 'The secret of your success is found in your daily routine.', category: 'Discipline' },
    { text: 'You\'ll never change your life until you change something you do daily.', category: 'Discipline' }
  ] },
  { day: 112, quotes: [
    { text: 'Success isn\'t always about greatness. It\'s about consistency.', category: 'Discipline' },
    { text: 'Self-discipline is the bridge between goals and accomplishment.', category: 'Discipline' },
    { text: 'Don\'t break the chain. One day at a time.', category: 'Discipline' },
    { text: 'What you do every day matters more than what you do once in a while.', category: 'Discipline' },
    { text: 'Habits are the compound interest of self-improvement.', category: 'Discipline' }
  ] },
  { day: 113, quotes: [
    { text: 'The price of discipline is always less than the pain of regret.', category: 'Discipline' },
    { text: 'One percent better every day. That\'s 37 times better in a year.', category: 'Discipline' },
    { text: 'You don\'t rise to the level of your goals. You fall to the level of your systems.', category: 'Discipline' },
    { text: 'Nothing will work unless you do.', category: 'Discipline' },
    { text: 'Dripping water hollows out stone not through force but through persistence.', category: 'Discipline' }
  ] },
  { day: 114, quotes: [
    { text: 'Don\'t count the days. Make the days count.', category: 'Discipline' },
    { text: 'Start where you are. Use what you have. Do what you can.', category: 'Discipline' },
    { text: 'Don\'t wait for motivation. Create momentum.', category: 'Discipline' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', category: 'Discipline' },
    { text: 'Make each day your masterpiece.', category: 'Discipline' }
  ] },
  { day: 115, quotes: [
    { text: 'Drop by drop the bucket fills.', category: 'Discipline' },
    { text: 'The difference between who you are and who you want to be is what you do.', category: 'Discipline' },
    { text: 'First we form habits then they form us.', category: 'Discipline' },
    { text: 'Your daily choices are shaping your future right now.', category: 'Discipline' },
    { text: 'Routine is liberation. When habits are automatic willpower is free.', category: 'Discipline' }
  ] },
  { day: 116, quotes: [
    { text: 'The best way to predict your future is to create it.', category: 'Discipline' },
    { text: 'Discipline is remembering what you want.', category: 'Discipline' },
    { text: 'Little by little one travels far.', category: 'Discipline' },
    { text: 'An ounce of action is worth a ton of theory.', category: 'Discipline' },
    { text: 'Small disciplines repeated with consistency lead to great achievements.', category: 'Discipline' }
  ] },
  { day: 117, quotes: [
    { text: 'Do what is hard and your life will be easy.', category: 'Discipline' },
    { text: 'Automate the good. Eliminate the bad. That\'s the whole system.', category: 'Discipline' },
    { text: 'Energy and persistence conquer all things.', category: 'Discipline' },
    { text: 'Your habits are the architects of your destiny.', category: 'Discipline' },
    { text: 'Consistency is the true foundation of trust.', category: 'Discipline' }
  ] },
  { day: 118, quotes: [
    { text: 'The power of small wins cannot be overstated.', category: 'Discipline' },
    { text: 'Be patient with yourself. Self-growth is tender.', category: 'Discipline' },
    { text: 'What seems like overnight success is usually years of consistent work.', category: 'Discipline' },
    { text: 'When you master your habits you master your life.', category: 'Discipline' },
    { text: 'Repetition is the mother of learning and the architect of accomplishment.', category: 'Discipline' }
  ] },
  { day: 119, quotes: [
    { text: 'Whether you think you can or you think you can\'t you\'re right.', category: 'Mindset' },
    { text: 'Your mind is a garden. Your thoughts are the seeds.', category: 'Mindset' },
    { text: 'Change your thoughts and you change your world.', category: 'Mindset' },
    { text: 'Believe you can and you\'re halfway there.', category: 'Mindset' },
    { text: 'What you focus on expands. Focus on solutions.', category: 'Mindset' }
  ] },
  { day: 120, quotes: [
    { text: 'The mind is everything. What you think you become.', category: 'Mindset' },
    { text: 'Everything you\'ve ever wanted is on the other side of fear.', category: 'Mindset' },
    { text: 'Life is 10% what happens to you and 90% how you react to it.', category: 'Mindset' },
    { text: 'You are capable of more than you know.', category: 'Mindset' },
    { text: 'Doubt kills more dreams than failure ever will.', category: 'Mindset' }
  ] },
  { day: 121, quotes: [
    { text: 'The way you speak to yourself matters. Be kind.', category: 'Mindset' },
    { text: 'Don\'t let yesterday take up too much of today.', category: 'Mindset' },
    { text: 'Your life does not get better by chance. It gets better by change.', category: 'Mindset' },
    { text: 'Everything is figureoutable.', category: 'Mindset' },
    { text: 'You can\'t go back and change the beginning but you can start where you are.', category: 'Mindset' }
  ] },
  { day: 122, quotes: [
    { text: 'A calm mind brings inner strength and self-confidence.', category: 'Mindset' },
    { text: 'Impossible is just an opinion.', category: 'Mindset' },
    { text: 'The way to get started is to quit talking and begin doing.', category: 'Mindset' },
    { text: 'Challenges make life interesting. Overcoming them makes life meaningful.', category: 'Mindset' },
    { text: 'Be stubborn about your goals and flexible about your methods.', category: 'Mindset' }
  ] },
  { day: 123, quotes: [
    { text: 'Where focus goes energy flows.', category: 'Mindset' },
    { text: 'Strength comes from overcoming what you thought you couldn\'t.', category: 'Mindset' },
    { text: 'You are enough just as you are. And getting better every day.', category: 'Mindset' },
    { text: 'Stop being afraid of what could go wrong. Be excited about what could go right.', category: 'Mindset' },
    { text: 'Every morning you choose: sleep with dreams or wake up and chase them.', category: 'Mindset' }
  ] },
  { day: 124, quotes: [
    { text: 'Your attitude determines your direction.', category: 'Mindset' },
    { text: 'Don\'t limit your challenges. Challenge your limits.', category: 'Mindset' },
    { text: 'The only person you are destined to become is the person you decide to be.', category: 'Mindset' },
    { text: 'Worrying does not take away tomorrow\'s troubles. It takes away today\'s peace.', category: 'Mindset' },
    { text: 'Your potential is endless.', category: 'Mindset' }
  ] },
  { day: 125, quotes: [
    { text: 'Limitations live only in our minds.', category: 'Mindset' },
    { text: 'Our greatest glory is not in never falling but in rising every time we fall.', category: 'Mindset' },
    { text: 'What consumes your mind controls your life.', category: 'Mindset' },
    { text: 'Thinking will not overcome fear but action will.', category: 'Mindset' },
    { text: 'No one can make you feel inferior without your consent.', category: 'Mindset' }
  ] },
  { day: 126, quotes: [
    { text: 'The biggest risk is not taking any risk.', category: 'Mindset' },
    { text: 'You were born to be real not to be perfect.', category: 'Mindset' },
    { text: 'Your beliefs become your thoughts. Your thoughts become your actions.', category: 'Mindset' },
    { text: 'The greatest discovery is that you can change your future by changing your attitude.', category: 'Mindset' },
    { text: 'Positive thinking lets you do everything better than negative thinking will.', category: 'Mindset' }
  ] },
  { day: 127, quotes: [
    { text: 'A journey of a thousand miles begins with a single step.', category: 'Small Steps' },
    { text: 'Big things are built one small piece at a time.', category: 'Small Steps' },
    { text: 'Progress is progress no matter how small.', category: 'Small Steps' },
    { text: 'Every expert was once a beginner.', category: 'Small Steps' },
    { text: 'The only impossible journey is the one you never begin.', category: 'Small Steps' }
  ] },
  { day: 128, quotes: [
    { text: 'A year from now you\'ll wish you had started today.', category: 'Small Steps' },
    { text: 'Your future is created by what you do today not tomorrow.', category: 'Small Steps' },
    { text: 'Step by step. Day by day. Payment by payment.', category: 'Small Steps' },
    { text: 'Focus on the step in front of you not the whole staircase.', category: 'Small Steps' },
    { text: 'Small wins fuel big victories.', category: 'Small Steps' }
  ] },
  { day: 129, quotes: [
    { text: 'One step at a time is still walking.', category: 'Small Steps' },
    { text: 'The compound effect of tiny daily improvements is remarkable.', category: 'Small Steps' },
    { text: 'The secret of getting ahead is getting started.', category: 'Small Steps' },
    { text: 'Do something today that your future self will thank you for.', category: 'Small Steps' },
    { text: 'Think big start small act now.', category: 'Small Steps' }
  ] },
  { day: 130, quotes: [
    { text: 'Every accomplishment starts with the decision to try.', category: 'Small Steps' },
    { text: 'Begin wherever you are and start taking action.', category: 'Small Steps' },
    { text: 'An ant can carry fifty times its own weight. You can carry more than you think.', category: 'Small Steps' },
    { text: 'Great things are done by a series of small things brought together.', category: 'Small Steps' },
    { text: 'You are making progress even on the days it doesn\'t feel like it.', category: 'Small Steps' }
  ] },
  { day: 131, quotes: [
    { text: 'Not all steps forward are big. But they all move you closer.', category: 'Small Steps' },
    { text: 'Movement in any direction is better than standing still.', category: 'Small Steps' },
    { text: 'The beginning is always today.', category: 'Small Steps' },
    { text: 'Little strokes fell great oaks.', category: 'Small Steps' },
    { text: 'The man who moves a mountain begins by carrying away small stones.', category: 'Small Steps' }
  ] },
  { day: 132, quotes: [
    { text: 'You don\'t have to be extreme. Just consistent.', category: 'Small Steps' },
    { text: 'Inch by inch anything\'s a cinch.', category: 'Small Steps' },
    { text: 'Steady progress is better than sudden perfection.', category: 'Small Steps' },
    { text: 'Don\'t overwhelm yourself with the big picture. Focus on the next right step.', category: 'Small Steps' },
    { text: 'Ten minutes of action beats ten hours of planning.', category: 'Small Steps' }
  ] },
  { day: 133, quotes: [
    { text: 'Never underestimate the power of small beginnings.', category: 'Small Steps' },
    { text: 'Take it one day at a time. That\'s all anyone can do.', category: 'Small Steps' },
    { text: 'What you do today is important because you\'re exchanging a day of your life for it.', category: 'Small Steps' },
    { text: 'The shortest way to do many things is to do one thing at a time.', category: 'Small Steps' },
    { text: 'Tomorrow becomes never. Take the first step now.', category: 'Small Steps' }
  ] },
  { day: 134, quotes: [
    { text: 'Plant seeds of effort today; harvest success tomorrow.', category: 'Small Steps' },
    { text: 'You eat an elephant one bite at a time.', category: 'Small Steps' },
    { text: 'Success is a series of small wins stacked on top of each other.', category: 'Small Steps' },
    { text: 'Don\'t wait for the perfect moment. Take the moment and make it perfect.', category: 'Small Steps' },
    { text: 'A small positive step is better than a large step in no direction.', category: 'Small Steps' }
  ] },
  { day: 135, quotes: [
    { text: 'Patience is not the ability to wait but to keep a good attitude while waiting.', category: 'Patience' },
    { text: 'Trust the process. Results come to those who earn them.', category: 'Patience' },
    { text: 'Nature does not hurry yet everything is accomplished.', category: 'Patience' },
    { text: 'Slow and steady wins the race.', category: 'Patience' },
    { text: 'Don\'t rush the process. Good things take time.', category: 'Patience' }
  ] },
  { day: 136, quotes: [
    { text: 'Patience is bitter but its fruit is sweet.', category: 'Patience' },
    { text: 'Your time is coming. Just keep doing the work.', category: 'Patience' },
    { text: 'Growth is silent. You won\'t hear it but you\'ll feel it.', category: 'Patience' },
    { text: 'Rest if you must but don\'t quit.', category: 'Patience' },
    { text: 'Success is a marathon not a sprint.', category: 'Patience' }
  ] },
  { day: 137, quotes: [
    { text: 'Seeds don\'t become trees overnight.', category: 'Patience' },
    { text: 'The oak tree was once a little nut that held its ground.', category: 'Patience' },
    { text: 'Progress takes patience. Give yourself grace.', category: 'Patience' },
    { text: 'Delays are not denials.', category: 'Patience' },
    { text: 'What feels slow now is building something that will last.', category: 'Patience' }
  ] },
  { day: 138, quotes: [
    { text: 'Trust the wait. Embrace the uncertainty.', category: 'Patience' },
    { text: 'Even flowers need time to bloom.', category: 'Patience' },
    { text: 'Patience is the companion of wisdom.', category: 'Patience' },
    { text: 'Adopt the pace of nature: her secret is patience.', category: 'Patience' },
    { text: 'All in good time. Just keep showing up.', category: 'Patience' }
  ] },
  { day: 139, quotes: [
    { text: 'Everything is hard before it is easy.', category: 'Patience' },
    { text: 'Things work out best for those who make the best of how things work out.', category: 'Patience' },
    { text: 'Have faith in the timing of your life.', category: 'Patience' },
    { text: 'You are right on time.', category: 'Patience' },
    { text: 'The longer the wait the sweeter the reward.', category: 'Patience' }
  ] },
  { day: 140, quotes: [
    { text: 'Be patient. Everything comes to you in the right moment.', category: 'Patience' },
    { text: 'Great works are performed not by strength but by perseverance.', category: 'Patience' },
    { text: 'Have patience. All things are difficult before they become easy.', category: 'Patience' },
    { text: 'Where you are is not who you are.', category: 'Patience' },
    { text: 'Believe in the power of yet. You\'re not there yet.', category: 'Patience' }
  ] },
  { day: 141, quotes: [
    { text: 'You are worth more than the sum of your debts.', category: 'Self-Worth' },
    { text: 'Your net worth is not your self-worth.', category: 'Self-Worth' },
    { text: 'You deserve financial peace. Not someday. Now.', category: 'Self-Worth' },
    { text: 'Be proud of how hard you are trying.', category: 'Self-Worth' },
    { text: 'You are not your mistakes. You are the lessons you learn from them.', category: 'Self-Worth' }
  ] },
  { day: 142, quotes: [
    { text: 'Speak to yourself like someone you love.', category: 'Self-Worth' },
    { text: 'You are allowed to be both a masterpiece and a work in progress.', category: 'Self-Worth' },
    { text: 'Investing in yourself is the best investment you will ever make.', category: 'Self-Worth' },
    { text: 'Stop shrinking to fit places you\'ve outgrown.', category: 'Self-Worth' },
    { text: 'Confidence comes from keeping the promises you make to yourself.', category: 'Self-Worth' }
  ] },
  { day: 143, quotes: [
    { text: 'You have survived 100% of your worst days.', category: 'Self-Worth' },
    { text: 'You are the only person who gets to decide what you are worth.', category: 'Self-Worth' },
    { text: 'You already have everything you need to begin.', category: 'Self-Worth' },
    { text: 'Self-care is not selfish. It\'s essential.', category: 'Self-Worth' },
    { text: 'You are the CEO of your life. Start making executive decisions.', category: 'Self-Worth' }
  ] },
  { day: 144, quotes: [
    { text: 'Be gentle with yourself. You\'re doing the best you can.', category: 'Self-Worth' },
    { text: 'What makes you different makes you strong.', category: 'Self-Worth' },
    { text: 'Love yourself enough to set boundaries.', category: 'Self-Worth' },
    { text: 'The most powerful relationship you will ever have is with yourself.', category: 'Self-Worth' },
    { text: 'You didn\'t come this far to be average.', category: 'Self-Worth' }
  ] },
  { day: 145, quotes: [
    { text: 'Owning our story is the bravest thing we\'ll ever do.', category: 'Self-Worth' },
    { text: 'You were not born to just pay bills and die.', category: 'Self-Worth' },
    { text: 'You are one decision away from a completely different life.', category: 'Self-Worth' },
    { text: 'Be so good they can\'t ignore you.', category: 'Self-Worth' },
    { text: 'The world needs who you were made to be.', category: 'Self-Worth' }
  ] },
  { day: 146, quotes: [
    { text: 'Vulnerability is not weakness. It\'s our greatest measure of courage.', category: 'Self-Worth' },
    { text: 'Don\'t let the noise of others\' opinions drown out your inner voice.', category: 'Self-Worth' },
    { text: 'You can\'t pour from an empty cup. Take care of yourself first.', category: 'Self-Worth' },
    { text: 'Stop apologizing for who you are becoming.', category: 'Self-Worth' },
    { text: 'Nobody is going to hit a home run for you. Step up to the plate.', category: 'Self-Worth' }
  ] },
  { day: 147, quotes: [
    { text: 'Gratitude turns what we have into enough.', category: 'Gratitude' },
    { text: 'Be thankful for what you have. You\'ll end up having more.', category: 'Gratitude' },
    { text: 'When you focus on the good the good gets better.', category: 'Gratitude' },
    { text: 'There is always something to be grateful for.', category: 'Gratitude' },
    { text: 'Wake up with determination. Go to bed with satisfaction.', category: 'Gratitude' }
  ] },
  { day: 148, quotes: [
    { text: 'Trade your expectation for appreciation and the world changes.', category: 'Gratitude' },
    { text: 'Appreciate where you are in your journey even if it\'s not where you want to be.', category: 'Gratitude' },
    { text: 'Enjoy the little things. One day you\'ll realize they were the big things.', category: 'Gratitude' },
    { text: 'Today is a good day to have a good day.', category: 'Gratitude' },
    { text: 'Focus on how far you\'ve come not how far you have to go.', category: 'Gratitude' }
  ] },
  { day: 149, quotes: [
    { text: 'Every sunset is an opportunity to reset.', category: 'Gratitude' },
    { text: 'Find joy in the ordinary.', category: 'Gratitude' },
    { text: 'Every day may not be good but there is something good in every day.', category: 'Gratitude' },
    { text: 'Comparison is the thief of joy. Run your own race.', category: 'Gratitude' },
    { text: 'Your struggle is part of your story.', category: 'Gratitude' }
  ] },
  { day: 150, quotes: [
    { text: 'Not all storms come to disrupt your life. Some clear your path.', category: 'Gratitude' },
    { text: 'Perspective is everything.', category: 'Gratitude' },
    { text: 'Happiness is not something ready-made. It comes from your own actions.', category: 'Gratitude' },
    { text: 'Don\'t let things you can\'t control steal your joy.', category: 'Gratitude' },
    { text: 'When you can\'t find the sunshine be the sunshine.', category: 'Gratitude' }
  ] },
  { day: 151, quotes: [
    { text: 'You\'ve already overcome so much. Don\'t forget to celebrate that.', category: 'Gratitude' },
    { text: 'The happiest people make the best of everything.', category: 'Gratitude' },
    { text: 'Count your blessings not your problems.', category: 'Gratitude' },
    { text: 'What if you woke up today with only what you were grateful for yesterday?', category: 'Gratitude' },
    { text: 'Be grateful for every closed door. They guide you to the right one.', category: 'Gratitude' }
  ] },
  { day: 152, quotes: [
    { text: 'Joy is not in things. It is in us.', category: 'Gratitude' },
    { text: 'The real gift of gratitude is that the more grateful you are the more present you become.', category: 'Gratitude' },
    { text: 'Some days you just have to create your own sunshine.', category: 'Gratitude' },
    { text: 'Today\'s tears water tomorrow\'s gardens.', category: 'Gratitude' },
    { text: 'It\'s a beautiful day to be alive.', category: 'Gratitude' }
  ] },
  { day: 153, quotes: [
    { text: 'Every day is a fresh start. Breathe and begin again.', category: 'Fresh Starts' },
    { text: 'Today is the first day of the rest of your life.', category: 'Fresh Starts' },
    { text: 'New beginnings are often disguised as painful endings.', category: 'Fresh Starts' },
    { text: 'Hope is being able to see light despite all the darkness.', category: 'Fresh Starts' },
    { text: 'Tomorrow is another chance to get it right.', category: 'Fresh Starts' }
  ] },
  { day: 154, quotes: [
    { text: 'You can\'t start the next chapter if you keep re-reading the last one.', category: 'Fresh Starts' },
    { text: 'No matter how hard the past you can always begin again.', category: 'Fresh Starts' },
    { text: 'The sun will rise and we will try again.', category: 'Fresh Starts' },
    { text: 'It\'s never too late to become what you might have been.', category: 'Fresh Starts' },
    { text: 'Rock bottom became the solid foundation on which I rebuilt my life.', category: 'Fresh Starts' }
  ] },
  { day: 155, quotes: [
    { text: 'There are far better things ahead than any we leave behind.', category: 'Fresh Starts' },
    { text: 'Today you are one step closer to the life you want.', category: 'Fresh Starts' },
    { text: 'Even the darkest night will end and the sun will rise.', category: 'Fresh Starts' },
    { text: 'The comeback is always stronger than the setback.', category: 'Fresh Starts' },
    { text: 'Let go of what was. Welcome what is.', category: 'Fresh Starts' }
  ] },
  { day: 156, quotes: [
    { text: 'Don\'t look back. You\'re not going that way.', category: 'Fresh Starts' },
    { text: 'The beautiful thing about a new day is the slate is clean.', category: 'Fresh Starts' },
    { text: 'Failure is simply the opportunity to begin again more intelligently.', category: 'Fresh Starts' },
    { text: 'If plan A doesn\'t work the alphabet has 25 more letters.', category: 'Fresh Starts' },
    { text: 'You are never too old to set another goal or dream a new dream.', category: 'Fresh Starts' }
  ] },
  { day: 157, quotes: [
    { text: 'Keep your face always toward the sunshine and shadows will fall behind you.', category: 'Fresh Starts' },
    { text: 'Rise above the storm and you will find the sunshine.', category: 'Fresh Starts' },
    { text: 'Mistakes are proof that you are trying.', category: 'Fresh Starts' },
    { text: 'Create the life you can\'t wait to wake up to.', category: 'Fresh Starts' },
    { text: 'A flower does not compete with the flower next to it. It just blooms.', category: 'Fresh Starts' }
  ] },
  { day: 158, quotes: [
    { text: 'And so the adventure begins.', category: 'Fresh Starts' },
    { text: 'After a storm comes a calm.', category: 'Fresh Starts' },
    { text: 'Every ending is a new beginning.', category: 'Fresh Starts' },
    { text: 'Your life isn\'t behind you. It\'s always in front of you.', category: 'Fresh Starts' },
    { text: 'Wake up every morning thinking something wonderful is about to happen.', category: 'Fresh Starts' }
  ] },
  { day: 159, quotes: [
    { text: 'Life doesn\'t get easier. You get stronger.', category: 'Strength' },
    { text: 'A smooth sea never made a skilled sailor.', category: 'Strength' },
    { text: 'What does not kill us makes us stronger.', category: 'Strength' },
    { text: 'The world breaks everyone and afterward many are strong at the broken places.', category: 'Strength' },
    { text: 'Be like water. It can cut through rock.', category: 'Strength' }
  ] },
  { day: 160, quotes: [
    { text: 'I am not what happened to me. I am what I choose to become.', category: 'Strength' },
    { text: 'Turn your wounds into wisdom.', category: 'Strength' },
    { text: 'Life is tough but so are you.', category: 'Strength' },
    { text: 'A diamond is a chunk of coal that did well under pressure.', category: 'Strength' },
    { text: 'Strength grows in the moments you think you can\'t go on but keep going.', category: 'Strength' }
  ] },
  { day: 161, quotes: [
    { text: 'Pain is temporary. Quitting lasts forever.', category: 'Strength' },
    { text: 'Broken crayons still color.', category: 'Strength' },
    { text: 'You don\'t know how strong you are until being strong is your only choice.', category: 'Strength' },
    { text: 'In the middle of difficulty lies opportunity.', category: 'Strength' },
    { text: 'Tough times don\'t last. Tough people do.', category: 'Strength' }
  ] },
  { day: 162, quotes: [
    { text: 'You are the sky. Everything else is just the weather.', category: 'Strength' },
    { text: 'Steel is forged in fire. Diamonds are made under pressure. So are you.', category: 'Strength' },
    { text: 'I can be changed by what happens to me. But I refuse to be reduced by it.', category: 'Strength' },
    { text: 'Don\'t pray for an easy life. Pray for the strength to endure a difficult one.', category: 'Strength' },
    { text: 'Your hardest times often lead to the greatest moments of your life.', category: 'Strength' }
  ] },
  { day: 163, quotes: [
    { text: 'Where there is no struggle there is no strength.', category: 'Strength' },
    { text: 'Not everything that is faced can be changed but nothing can be changed until it is faced.', category: 'Strength' },
    { text: 'Difficulties in life are intended to make us better not bitter.', category: 'Strength' },
    { text: 'A hero is an ordinary individual who finds the strength to persevere.', category: 'Strength' },
    { text: 'Sometimes you have to get knocked down lower to stand up taller.', category: 'Strength' }
  ] },
  { day: 164, quotes: [
    { text: 'We develop courage by surviving difficult times.', category: 'Strength' },
    { text: 'When the going gets tough the tough get going.', category: 'Strength' },
    { text: 'You may have to fight a battle more than once to win it.', category: 'Strength' },
    { text: 'Scars are just tattoos with better stories.', category: 'Strength' },
    { text: 'You can\'t calm the storm. What you can do is calm yourself.', category: 'Strength' }
  ] },
  { day: 165, quotes: [
    { text: 'You are not your debt. You are the person brave enough to face it.', category: 'Debt Motivation' },
    { text: 'Every dollar toward your balance is a vote for the life you want.', category: 'Debt Motivation' },
    { text: 'Dex says: one payment at a time one day at a time one win at a time.', category: 'Debt Motivation' },
    { text: 'That feeling when your balance is lower than last month? That\'s momentum.', category: 'Debt Motivation' },
    { text: 'Debt doesn\'t define your story. How you handle it does.', category: 'Debt Motivation' }
  ] },
  { day: 166, quotes: [
    { text: 'Today you are closer to zero than you\'ve ever been.', category: 'Debt Motivation' },
    { text: 'Payoff day is coming. Every payment brings it closer.', category: 'Debt Motivation' },
    { text: 'You chose to face this. That already makes you braver than most.', category: 'Debt Motivation' },
    { text: 'Small payments end big debts.', category: 'Debt Motivation' },
    { text: 'Your credit cards don\'t own you. You own your future.', category: 'Debt Motivation' }
  ] },
  { day: 167, quotes: [
    { text: 'The best revenge against debt is a boring consistent payment plan.', category: 'Debt Motivation' },
    { text: 'You\'re playing the long game. Long games always win.', category: 'Debt Motivation' },
    { text: 'Debt payoff is not exciting. It\'s empowering.', category: 'Debt Motivation' },
    { text: 'One less bill. One more breath of freedom.', category: 'Debt Motivation' },
    { text: 'The only bad payment is the one you didn\'t make.', category: 'Debt Motivation' }
  ] },
  { day: 168, quotes: [
    { text: 'Celebrate every milestone. Every hundred dollars paid off matters.', category: 'Debt Motivation' },
    { text: 'This month\'s sacrifice is next year\'s freedom.', category: 'Debt Motivation' },
    { text: 'Financial freedom starts the moment you decide to fight for it.', category: 'Debt Motivation' },
    { text: 'Debt is a chapter not the whole book.', category: 'Debt Motivation' },
    { text: 'The balance goes down. The confidence goes up.', category: 'Debt Motivation' }
  ] },
  { day: 169, quotes: [
    { text: 'Making a payment when money is tight isn\'t easy. It\'s heroic.', category: 'Debt Motivation' },
    { text: 'You\'re doing something most people avoid. That takes guts.', category: 'Debt Motivation' },
    { text: 'Look how far you\'ve come. Now imagine six months from now.', category: 'Debt Motivation' },
    { text: 'Your payoff date isn\'t a dream. It\'s a deadline.', category: 'Debt Motivation' },
    { text: 'Every time you say no to what you can\'t afford you say yes to something bigger.', category: 'Debt Motivation' }
  ] },
  { day: 170, quotes: [
    { text: 'Even on the hard days the balance went down. That counts.', category: 'Debt Motivation' },
    { text: 'One day this will all be a memory. A proud one.', category: 'Debt Motivation' },
    { text: 'You started. That\'s the hardest part. Now just don\'t stop.', category: 'Debt Motivation' },
    { text: 'The spreadsheet doesn\'t lie. You\'re winning.', category: 'Debt Motivation' },
    { text: 'Dex is rooting for you. And so is your future self.', category: 'Debt Motivation' }
  ] },
  { day: 171, quotes: [
    { text: 'You will tell this story someday. Make the ending great.', category: 'Debt Motivation' },
    { text: 'A debt-free life is built in the boring middle. Keep building.', category: 'Debt Motivation' },
    { text: 'Interest is the price of impatience. Patience is your superpower now.', category: 'Debt Motivation' },
    { text: 'You are literally buying your freedom back one payment at a time.', category: 'Debt Motivation' },
    { text: 'When in doubt make a payment.', category: 'Debt Motivation' }
  ] },
  { day: 172, quotes: [
    { text: 'Debt is temporary. The character you build paying it off is permanent.', category: 'Debt Motivation' },
    { text: 'Right now someone with half your income is debt-free because they decided to be.', category: 'Debt Motivation' },
    { text: 'Snowball or avalanche - pick a method and start rolling.', category: 'Debt Motivation' },
    { text: 'There is no pride in being in debt. There is massive pride in getting out.', category: 'Debt Motivation' },
    { text: 'The first rule of getting out of a hole is to stop digging.', category: 'Debt Motivation' }
  ] },
  { day: 173, quotes: [
    { text: 'Live like no one else now so later you can live like no one else.', category: 'Debt Motivation' },
    { text: 'Net worth is built in the boring months. Keep being boring.', category: 'Debt Motivation' },
    { text: 'Your future isn\'t written in your debt balance. It\'s written in your daily decisions.', category: 'Debt Motivation' },
    { text: 'Be weird. Be the person who actually follows a budget.', category: 'Debt Motivation' },
    { text: 'Frugal isn\'t cheap. Frugal is free.', category: 'Debt Motivation' }
  ] },
  { day: 174, quotes: [
    { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', category: 'Action' },
    { text: 'Well done is better than well said.', category: 'Action' },
    { text: 'Stop wishing. Start doing.', category: 'Action' },
    { text: 'You miss 100% of the shots you don\'t take.', category: 'Action' },
    { text: 'Fortune favors the bold.', category: 'Action' }
  ] },
  { day: 175, quotes: [
    { text: 'Get started. The rest will follow.', category: 'Action' },
    { text: 'Do it now. Sometimes later becomes never.', category: 'Action' },
    { text: 'You are what you do not what you say you\'ll do.', category: 'Action' },
    { text: 'Be the hero of your own life.', category: 'Action' },
    { text: 'The path to success is to take massive determined action.', category: 'Action' }
  ] },
  { day: 176, quotes: [
    { text: 'Don\'t wait for opportunity. Create it.', category: 'Action' },
    { text: 'Life rewards those who take action.', category: 'Action' },
    { text: 'Dream it. Believe it. Build it.', category: 'Action' },
    { text: 'Don\'t stop until you\'re proud.', category: 'Action' },
    { text: 'Go the extra mile. It\'s never crowded.', category: 'Action' }
  ] },
  { day: 177, quotes: [
    { text: 'Hard work beats talent when talent doesn\'t work hard.', category: 'Action' },
    { text: 'Opportunities don\'t happen. You create them.', category: 'Action' },
    { text: 'Stay hungry. Stay foolish.', category: 'Action' },
    { text: 'The difference between ordinary and extraordinary is that little extra.', category: 'Action' },
    { text: 'Turn your can\'ts into cans and your dreams into plans.', category: 'Action' }
  ] },
  { day: 178, quotes: [
    { text: 'If it doesn\'t challenge you it doesn\'t change you.', category: 'Action' },
    { text: 'Every champion was once a contender who refused to give up.', category: 'Action' },
    { text: 'Winners are not people who never fail. They are people who never quit.', category: 'Action' },
    { text: 'The harder you work the greater you\'ll feel when you achieve it.', category: 'Action' },
    { text: 'Hustle until you no longer have to introduce yourself.', category: 'Action' }
  ] },
  { day: 179, quotes: [
    { text: 'It\'s going to be hard but hard does not mean impossible.', category: 'Action' },
    { text: 'If you want something you\'ve never had be willing to do what you\'ve never done.', category: 'Action' },
    { text: 'Procrastination is the art of keeping up with yesterday.', category: 'Action' },
    { text: 'Knowledge is of no value unless you put it into practice.', category: 'Action' },
    { text: 'People who say it cannot be done should not interrupt those doing it.', category: 'Action' }
  ] },
  { day: 180, quotes: [
    { text: 'Peace is not the absence of trouble but the presence of calm.', category: 'Peace' },
    { text: 'Almost everything will work again if you unplug it for a few minutes. Including you.', category: 'Peace' },
    { text: 'The greatest wealth is health.', category: 'Peace' },
    { text: 'Rest when you\'re weary. Refresh yourself. Then get back to work.', category: 'Peace' },
    { text: 'Your calm mind is the ultimate weapon against your challenges.', category: 'Peace' }
  ] },
  { day: 181, quotes: [
    { text: 'You owe yourself the love that you so freely give to other people.', category: 'Peace' },
    { text: 'Self-care is how you take your power back.', category: 'Peace' },
    { text: 'Be where you are not where you think you should be.', category: 'Peace' },
    { text: 'Breathe. Let go. This moment is all you have for sure.', category: 'Peace' },
    { text: 'Taking time to do nothing often brings everything into perspective.', category: 'Peace' }
  ] },
  { day: 182, quotes: [
    { text: 'Don\'t trade your peace for a paycheck. Find a way to have both.', category: 'Peace' },
    { text: 'Healing is not linear.', category: 'Peace' },
    { text: 'Happiness is an inside job.', category: 'Peace' },
    { text: 'Inner peace begins when you stop letting others control your emotions.', category: 'Peace' },
    { text: 'Serenity is not freedom from the storm but peace amid the storm.', category: 'Peace' }
  ] },
  { day: 183, quotes: [
    { text: 'You are not a machine. Rest is not a reward. It is a requirement.', category: 'Peace' },
    { text: 'The greatest gift you can give yourself is a little of your own attention.', category: 'Peace' },
    { text: 'Mental health is a process not a destination.', category: 'Peace' },
    { text: 'Don\'t let anxiety steal today because of what might happen tomorrow.', category: 'Peace' },
    { text: 'Sometimes the most productive thing you can do is relax.', category: 'Peace' }
  ] },
  { day: 184, quotes: [
    { text: 'You only live once but if you do it right once is enough.', category: 'Inspiration' },
    { text: 'Try to be a rainbow in someone\'s cloud.', category: 'Inspiration' },
    { text: 'Whatever you are be a good one.', category: 'Inspiration' },
    { text: 'When the world says give up hope whispers try one more time.', category: 'Inspiration' },
    { text: 'Be kind whenever possible. It is always possible.', category: 'Inspiration' }
  ] },
  { day: 185, quotes: [
    { text: 'It is during our darkest moments that we must focus to see the light.', category: 'Inspiration' },
    { text: 'You always pass failure on the way to success.', category: 'Inspiration' },
    { text: 'In a gentle way you can shake the world.', category: 'Inspiration' },
    { text: 'Everything will be okay in the end. If it\'s not okay it\'s not the end.', category: 'Inspiration' },
    { text: 'Stay close to people who feel like sunshine.', category: 'Inspiration' }
  ] },
  { day: 186, quotes: [
    { text: 'Not all who wander are lost.', category: 'Inspiration' },
    { text: 'No rain no flowers.', category: 'Inspiration' },
    { text: 'And still I rise.', category: 'Inspiration' },
    { text: 'Be the energy you want to attract.', category: 'Inspiration' },
    { text: 'The best is yet to come.', category: 'Inspiration' }
  ] },
  { day: 187, quotes: [
    { text: 'Work hard in silence. Let your success be your noise.', category: 'Inspiration' },
    { text: 'She believed she could so she did.', category: 'Inspiration' },
    { text: 'Prove them wrong.', category: 'Inspiration' },
    { text: 'Bloom where you are planted.', category: 'Inspiration' },
    { text: 'Life is either a daring adventure or nothing at all.', category: 'Inspiration' }
  ] },
  { day: 188, quotes: [
    { text: 'Act as if what you do makes a difference. It does.', category: 'Inspiration' },
    { text: 'Every moment is a fresh beginning.', category: 'Inspiration' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', category: 'Inspiration' },
    { text: 'Keep smiling because life is a beautiful thing.', category: 'Inspiration' },
    { text: 'Life is a balance of holding on and letting go.', category: 'Inspiration' }
  ] },
  { day: 189, quotes: [
    { text: 'Every dollar you put toward debt is a dollar invested in your freedom.', category: 'Financial Freedom' },
    { text: 'Debt is the thief of tomorrow\'s choices. Take them back today.', category: 'Financial Freedom' },
    { text: 'Financial freedom isn\'t about being rich. It\'s about having options.', category: 'Financial Freedom' },
    { text: 'The best time to start paying off debt was years ago. The second best is now.', category: 'Financial Freedom' },
    { text: 'You don\'t need a perfect plan. You need a first payment.', category: 'Financial Freedom' }
  ] },
  { day: 190, quotes: [
    { text: 'Money problems are temporary. The habits you build solving them are permanent.', category: 'Financial Freedom' },
    { text: 'Every debt you pay off is a chain you break.', category: 'Financial Freedom' },
    { text: 'Being debt-free isn\'t a destination. It\'s how you travel through life.', category: 'Financial Freedom' },
    { text: 'Wealth isn\'t what you earn. It\'s what you keep after bills are paid.', category: 'Financial Freedom' },
    { text: 'A budget isn\'t a punishment. It\'s permission to spend without guilt.', category: 'Financial Freedom' }
  ] },
  { day: 191, quotes: [
    { text: 'You are not your credit score. But improving it feels great.', category: 'Financial Freedom' },
    { text: 'The interest you\'re not paying is the raise you gave yourself.', category: 'Financial Freedom' },
    { text: 'Financial peace is worth more than anything you could buy on credit.', category: 'Financial Freedom' },
    { text: 'Stop paying for yesterday. Start investing in tomorrow.', category: 'Financial Freedom' },
    { text: 'Every paycheck is a fresh chance to change your financial future.', category: 'Financial Freedom' }
  ] },
  { day: 192, quotes: [
    { text: 'You didn\'t get into debt overnight. You won\'t get out overnight. But you will.', category: 'Financial Freedom' },
    { text: 'The road to financial freedom is paved with boring consistent payments.', category: 'Financial Freedom' },
    { text: 'Your future self will thank you for every sacrifice you make today.', category: 'Financial Freedom' },
    { text: 'Debt is a promise to your past. Freedom is a promise to your future.', category: 'Financial Freedom' },
    { text: 'When you owe nothing everything you earn is yours.', category: 'Financial Freedom' }
  ] },
  { day: 193, quotes: [
    { text: 'A debt-free life isn\'t about deprivation. It\'s about liberation.', category: 'Financial Freedom' },
    { text: 'You\'re not behind. You\'re exactly where your comeback starts.', category: 'Financial Freedom' },
    { text: 'The freedom you want is on the other side of the payments you\'re making.', category: 'Financial Freedom' },
    { text: 'The sacrifice is temporary. The freedom is permanent.', category: 'Financial Freedom' },
    { text: 'Compound interest works against you in debt. Make it work for you in savings.', category: 'Financial Freedom' }
  ] },
  { day: 194, quotes: [
    { text: 'Money is a tool. Debt is a trap. Freedom is the goal.', category: 'Financial Freedom' },
    { text: 'Live below your means today so you can live beyond them tomorrow.', category: 'Financial Freedom' },
    { text: 'The goal isn\'t to be rich. It\'s to be free.', category: 'Financial Freedom' },
    { text: 'Imagine waking up owing nothing. That morning is coming.', category: 'Financial Freedom' },
    { text: 'Broke is temporary. Poor is a mindset. You\'re choosing neither.', category: 'Financial Freedom' }
  ] },
  { day: 195, quotes: [
    { text: 'The best investment you\'ll ever make is paying off what you owe.', category: 'Financial Freedom' },
    { text: 'Every payment is proof that you chose your future over your past.', category: 'Financial Freedom' },
    { text: 'You are closer to debt-free today than you were yesterday.', category: 'Financial Freedom' },
    { text: 'Budgeting is telling your money where to go instead of wondering where it went.', category: 'Financial Freedom' },
    { text: 'The gap between your income and your spending is where freedom lives.', category: 'Financial Freedom' }
  ] },
  { day: 196, quotes: [
    { text: 'Your financial story isn\'t over. This is just the plot twist.', category: 'Financial Freedom' },
    { text: 'Don\'t compare your chapter one to someone else\'s chapter twenty.', category: 'Financial Freedom' },
    { text: 'Financial freedom is the ultimate form of self-care.', category: 'Financial Freedom' },
    { text: 'Money doesn\'t buy happiness but being free from debt buys peace.', category: 'Financial Freedom' },
    { text: 'There\'s no shame in having debt. There\'s power in deciding to end it.', category: 'Financial Freedom' }
  ] },
  { day: 197, quotes: [
    { text: 'Fall seven times stand up eight.', category: 'Perseverance' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', category: 'Perseverance' },
    { text: 'The only way out is through. Keep going.', category: 'Perseverance' },
    { text: 'Success is not final failure is not fatal: it is the courage to continue that counts.', category: 'Perseverance' },
    { text: 'A river cuts through rock not by power but by persistence.', category: 'Perseverance' }
  ] },
  { day: 198, quotes: [
    { text: 'You haven\'t come this far to only come this far.', category: 'Perseverance' },
    { text: 'Difficult roads often lead to beautiful destinations.', category: 'Perseverance' },
    { text: 'When you feel like quitting remember why you started.', category: 'Perseverance' },
    { text: 'The struggle you\'re in today is developing the strength you need for tomorrow.', category: 'Perseverance' },
    { text: 'Every setback is a setup for a comeback.', category: 'Perseverance' }
  ] },
  { day: 199, quotes: [
    { text: 'The moment you\'re ready to quit is usually right before a breakthrough.', category: 'Perseverance' },
    { text: 'Progress not perfection is what matters.', category: 'Perseverance' },
    { text: 'It always seems impossible until it\'s done.', category: 'Perseverance' },
    { text: 'If you\'re going through hell keep going.', category: 'Perseverance' },
    { text: 'The pain you feel today will be the strength you feel tomorrow.', category: 'Perseverance' }
  ] },
  { day: 200, quotes: [
    { text: 'Tough times never last but tough people do.', category: 'Perseverance' },
    { text: 'Small progress is still progress.', category: 'Perseverance' },
    { text: 'Storms make trees take deeper roots.', category: 'Perseverance' },
    { text: 'Your current situation is not your final destination.', category: 'Perseverance' },
    { text: 'You are braver than you believe stronger than you seem smarter than you think.', category: 'Perseverance' }
  ] },
  { day: 201, quotes: [
    { text: 'Most people give up just when they\'re about to achieve success.', category: 'Perseverance' },
    { text: 'Stars can\'t shine without darkness.', category: 'Perseverance' },
    { text: 'Keep planting. Keep watering. The harvest is coming.', category: 'Perseverance' },
    { text: 'Don\'t watch the clock. Do what it does. Keep going.', category: 'Perseverance' },
    { text: 'Champions keep playing until they get it right.', category: 'Perseverance' }
  ] },
  { day: 202, quotes: [
    { text: 'Patience and perseverance have a magical effect before which difficulties disappear.', category: 'Perseverance' },
    { text: 'The darkest hour has only sixty minutes.', category: 'Perseverance' },
    { text: 'Courage doesn\'t always roar. Sometimes it\'s the quiet voice saying I will try again tomorrow.', category: 'Perseverance' },
    { text: 'Push yourself because no one else is going to do it for you.', category: 'Perseverance' },
    { text: 'The human spirit is stronger than anything that can happen to it.', category: 'Perseverance' }
  ] },
  { day: 203, quotes: [
    { text: 'Endurance is not just bearing a hard thing but turning it into glory.', category: 'Perseverance' },
    { text: 'You were given this life because you are strong enough to live it.', category: 'Perseverance' },
    { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', category: 'Perseverance' },
    { text: 'One day you\'ll tell your story and it will become someone else\'s survival guide.', category: 'Perseverance' },
    { text: 'When everything seems against you remember airplanes take off against the wind.', category: 'Perseverance' }
  ] },
  { day: 204, quotes: [
    { text: 'Persistence can change failure into extraordinary achievement.', category: 'Perseverance' },
    { text: 'The oak fought the wind and was broken. The willow bent and survived.', category: 'Perseverance' },
    { text: 'Don\'t be discouraged. It\'s often the last key that opens the lock.', category: 'Perseverance' },
    { text: 'Not every day will be good. But there is good in every day.', category: 'Perseverance' },
    { text: 'Success is stumbling from failure to failure with no loss of enthusiasm.', category: 'Perseverance' }
  ] },
  { day: 205, quotes: [
    { text: 'Discipline is choosing between what you want now and what you want most.', category: 'Discipline' },
    { text: 'We are what we repeatedly do. Excellence is not an act but a habit.', category: 'Discipline' },
    { text: 'Motivation gets you started. Habit keeps you going.', category: 'Discipline' },
    { text: 'The secret of your success is found in your daily routine.', category: 'Discipline' },
    { text: 'You\'ll never change your life until you change something you do daily.', category: 'Discipline' }
  ] },
  { day: 206, quotes: [
    { text: 'Success isn\'t always about greatness. It\'s about consistency.', category: 'Discipline' },
    { text: 'Self-discipline is the bridge between goals and accomplishment.', category: 'Discipline' },
    { text: 'Don\'t break the chain. One day at a time.', category: 'Discipline' },
    { text: 'What you do every day matters more than what you do once in a while.', category: 'Discipline' },
    { text: 'Habits are the compound interest of self-improvement.', category: 'Discipline' }
  ] },
  { day: 207, quotes: [
    { text: 'The price of discipline is always less than the pain of regret.', category: 'Discipline' },
    { text: 'One percent better every day. That\'s 37 times better in a year.', category: 'Discipline' },
    { text: 'You don\'t rise to the level of your goals. You fall to the level of your systems.', category: 'Discipline' },
    { text: 'Nothing will work unless you do.', category: 'Discipline' },
    { text: 'Dripping water hollows out stone not through force but through persistence.', category: 'Discipline' }
  ] },
  { day: 208, quotes: [
    { text: 'Don\'t count the days. Make the days count.', category: 'Discipline' },
    { text: 'Start where you are. Use what you have. Do what you can.', category: 'Discipline' },
    { text: 'Don\'t wait for motivation. Create momentum.', category: 'Discipline' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', category: 'Discipline' },
    { text: 'Make each day your masterpiece.', category: 'Discipline' }
  ] },
  { day: 209, quotes: [
    { text: 'Drop by drop the bucket fills.', category: 'Discipline' },
    { text: 'The difference between who you are and who you want to be is what you do.', category: 'Discipline' },
    { text: 'First we form habits then they form us.', category: 'Discipline' },
    { text: 'Your daily choices are shaping your future right now.', category: 'Discipline' },
    { text: 'Routine is liberation. When habits are automatic willpower is free.', category: 'Discipline' }
  ] },
  { day: 210, quotes: [
    { text: 'The best way to predict your future is to create it.', category: 'Discipline' },
    { text: 'Discipline is remembering what you want.', category: 'Discipline' },
    { text: 'Little by little one travels far.', category: 'Discipline' },
    { text: 'An ounce of action is worth a ton of theory.', category: 'Discipline' },
    { text: 'Small disciplines repeated with consistency lead to great achievements.', category: 'Discipline' }
  ] },
  { day: 211, quotes: [
    { text: 'Do what is hard and your life will be easy.', category: 'Discipline' },
    { text: 'Automate the good. Eliminate the bad. That\'s the whole system.', category: 'Discipline' },
    { text: 'Energy and persistence conquer all things.', category: 'Discipline' },
    { text: 'Your habits are the architects of your destiny.', category: 'Discipline' },
    { text: 'Consistency is the true foundation of trust.', category: 'Discipline' }
  ] },
  { day: 212, quotes: [
    { text: 'The power of small wins cannot be overstated.', category: 'Discipline' },
    { text: 'Be patient with yourself. Self-growth is tender.', category: 'Discipline' },
    { text: 'What seems like overnight success is usually years of consistent work.', category: 'Discipline' },
    { text: 'When you master your habits you master your life.', category: 'Discipline' },
    { text: 'Repetition is the mother of learning and the architect of accomplishment.', category: 'Discipline' }
  ] },
  { day: 213, quotes: [
    { text: 'Whether you think you can or you think you can\'t you\'re right.', category: 'Mindset' },
    { text: 'Your mind is a garden. Your thoughts are the seeds.', category: 'Mindset' },
    { text: 'Change your thoughts and you change your world.', category: 'Mindset' },
    { text: 'Believe you can and you\'re halfway there.', category: 'Mindset' },
    { text: 'What you focus on expands. Focus on solutions.', category: 'Mindset' }
  ] },
  { day: 214, quotes: [
    { text: 'The mind is everything. What you think you become.', category: 'Mindset' },
    { text: 'Everything you\'ve ever wanted is on the other side of fear.', category: 'Mindset' },
    { text: 'Life is 10% what happens to you and 90% how you react to it.', category: 'Mindset' },
    { text: 'You are capable of more than you know.', category: 'Mindset' },
    { text: 'Doubt kills more dreams than failure ever will.', category: 'Mindset' }
  ] },
  { day: 215, quotes: [
    { text: 'The way you speak to yourself matters. Be kind.', category: 'Mindset' },
    { text: 'Don\'t let yesterday take up too much of today.', category: 'Mindset' },
    { text: 'Your life does not get better by chance. It gets better by change.', category: 'Mindset' },
    { text: 'Everything is figureoutable.', category: 'Mindset' },
    { text: 'You can\'t go back and change the beginning but you can start where you are.', category: 'Mindset' }
  ] },
  { day: 216, quotes: [
    { text: 'A calm mind brings inner strength and self-confidence.', category: 'Mindset' },
    { text: 'Impossible is just an opinion.', category: 'Mindset' },
    { text: 'The way to get started is to quit talking and begin doing.', category: 'Mindset' },
    { text: 'Challenges make life interesting. Overcoming them makes life meaningful.', category: 'Mindset' },
    { text: 'Be stubborn about your goals and flexible about your methods.', category: 'Mindset' }
  ] },
  { day: 217, quotes: [
    { text: 'Where focus goes energy flows.', category: 'Mindset' },
    { text: 'Strength comes from overcoming what you thought you couldn\'t.', category: 'Mindset' },
    { text: 'You are enough just as you are. And getting better every day.', category: 'Mindset' },
    { text: 'Stop being afraid of what could go wrong. Be excited about what could go right.', category: 'Mindset' },
    { text: 'Every morning you choose: sleep with dreams or wake up and chase them.', category: 'Mindset' }
  ] },
  { day: 218, quotes: [
    { text: 'Your attitude determines your direction.', category: 'Mindset' },
    { text: 'Don\'t limit your challenges. Challenge your limits.', category: 'Mindset' },
    { text: 'The only person you are destined to become is the person you decide to be.', category: 'Mindset' },
    { text: 'Worrying does not take away tomorrow\'s troubles. It takes away today\'s peace.', category: 'Mindset' },
    { text: 'Your potential is endless.', category: 'Mindset' }
  ] },
  { day: 219, quotes: [
    { text: 'Limitations live only in our minds.', category: 'Mindset' },
    { text: 'Our greatest glory is not in never falling but in rising every time we fall.', category: 'Mindset' },
    { text: 'What consumes your mind controls your life.', category: 'Mindset' },
    { text: 'Thinking will not overcome fear but action will.', category: 'Mindset' },
    { text: 'No one can make you feel inferior without your consent.', category: 'Mindset' }
  ] },
  { day: 220, quotes: [
    { text: 'The biggest risk is not taking any risk.', category: 'Mindset' },
    { text: 'You were born to be real not to be perfect.', category: 'Mindset' },
    { text: 'Your beliefs become your thoughts. Your thoughts become your actions.', category: 'Mindset' },
    { text: 'The greatest discovery is that you can change your future by changing your attitude.', category: 'Mindset' },
    { text: 'Positive thinking lets you do everything better than negative thinking will.', category: 'Mindset' }
  ] },
  { day: 221, quotes: [
    { text: 'A journey of a thousand miles begins with a single step.', category: 'Small Steps' },
    { text: 'Big things are built one small piece at a time.', category: 'Small Steps' },
    { text: 'Progress is progress no matter how small.', category: 'Small Steps' },
    { text: 'Every expert was once a beginner.', category: 'Small Steps' },
    { text: 'The only impossible journey is the one you never begin.', category: 'Small Steps' }
  ] },
  { day: 222, quotes: [
    { text: 'A year from now you\'ll wish you had started today.', category: 'Small Steps' },
    { text: 'Your future is created by what you do today not tomorrow.', category: 'Small Steps' },
    { text: 'Step by step. Day by day. Payment by payment.', category: 'Small Steps' },
    { text: 'Focus on the step in front of you not the whole staircase.', category: 'Small Steps' },
    { text: 'Small wins fuel big victories.', category: 'Small Steps' }
  ] },
  { day: 223, quotes: [
    { text: 'One step at a time is still walking.', category: 'Small Steps' },
    { text: 'The compound effect of tiny daily improvements is remarkable.', category: 'Small Steps' },
    { text: 'The secret of getting ahead is getting started.', category: 'Small Steps' },
    { text: 'Do something today that your future self will thank you for.', category: 'Small Steps' },
    { text: 'Think big start small act now.', category: 'Small Steps' }
  ] },
  { day: 224, quotes: [
    { text: 'Every accomplishment starts with the decision to try.', category: 'Small Steps' },
    { text: 'Begin wherever you are and start taking action.', category: 'Small Steps' },
    { text: 'An ant can carry fifty times its own weight. You can carry more than you think.', category: 'Small Steps' },
    { text: 'Great things are done by a series of small things brought together.', category: 'Small Steps' },
    { text: 'You are making progress even on the days it doesn\'t feel like it.', category: 'Small Steps' }
  ] },
  { day: 225, quotes: [
    { text: 'Not all steps forward are big. But they all move you closer.', category: 'Small Steps' },
    { text: 'Movement in any direction is better than standing still.', category: 'Small Steps' },
    { text: 'The beginning is always today.', category: 'Small Steps' },
    { text: 'Little strokes fell great oaks.', category: 'Small Steps' },
    { text: 'The man who moves a mountain begins by carrying away small stones.', category: 'Small Steps' }
  ] },
  { day: 226, quotes: [
    { text: 'You don\'t have to be extreme. Just consistent.', category: 'Small Steps' },
    { text: 'Inch by inch anything\'s a cinch.', category: 'Small Steps' },
    { text: 'Steady progress is better than sudden perfection.', category: 'Small Steps' },
    { text: 'Don\'t overwhelm yourself with the big picture. Focus on the next right step.', category: 'Small Steps' },
    { text: 'Ten minutes of action beats ten hours of planning.', category: 'Small Steps' }
  ] },
  { day: 227, quotes: [
    { text: 'Never underestimate the power of small beginnings.', category: 'Small Steps' },
    { text: 'Take it one day at a time. That\'s all anyone can do.', category: 'Small Steps' },
    { text: 'What you do today is important because you\'re exchanging a day of your life for it.', category: 'Small Steps' },
    { text: 'The shortest way to do many things is to do one thing at a time.', category: 'Small Steps' },
    { text: 'Tomorrow becomes never. Take the first step now.', category: 'Small Steps' }
  ] },
  { day: 228, quotes: [
    { text: 'Plant seeds of effort today; harvest success tomorrow.', category: 'Small Steps' },
    { text: 'You eat an elephant one bite at a time.', category: 'Small Steps' },
    { text: 'Success is a series of small wins stacked on top of each other.', category: 'Small Steps' },
    { text: 'Don\'t wait for the perfect moment. Take the moment and make it perfect.', category: 'Small Steps' },
    { text: 'A small positive step is better than a large step in no direction.', category: 'Small Steps' }
  ] },
  { day: 229, quotes: [
    { text: 'Patience is not the ability to wait but to keep a good attitude while waiting.', category: 'Patience' },
    { text: 'Trust the process. Results come to those who earn them.', category: 'Patience' },
    { text: 'Nature does not hurry yet everything is accomplished.', category: 'Patience' },
    { text: 'Slow and steady wins the race.', category: 'Patience' },
    { text: 'Don\'t rush the process. Good things take time.', category: 'Patience' }
  ] },
  { day: 230, quotes: [
    { text: 'Patience is bitter but its fruit is sweet.', category: 'Patience' },
    { text: 'Your time is coming. Just keep doing the work.', category: 'Patience' },
    { text: 'Growth is silent. You won\'t hear it but you\'ll feel it.', category: 'Patience' },
    { text: 'Rest if you must but don\'t quit.', category: 'Patience' },
    { text: 'Success is a marathon not a sprint.', category: 'Patience' }
  ] },
  { day: 231, quotes: [
    { text: 'Seeds don\'t become trees overnight.', category: 'Patience' },
    { text: 'The oak tree was once a little nut that held its ground.', category: 'Patience' },
    { text: 'Progress takes patience. Give yourself grace.', category: 'Patience' },
    { text: 'Delays are not denials.', category: 'Patience' },
    { text: 'What feels slow now is building something that will last.', category: 'Patience' }
  ] },
  { day: 232, quotes: [
    { text: 'Trust the wait. Embrace the uncertainty.', category: 'Patience' },
    { text: 'Even flowers need time to bloom.', category: 'Patience' },
    { text: 'Patience is the companion of wisdom.', category: 'Patience' },
    { text: 'Adopt the pace of nature: her secret is patience.', category: 'Patience' },
    { text: 'All in good time. Just keep showing up.', category: 'Patience' }
  ] },
  { day: 233, quotes: [
    { text: 'Everything is hard before it is easy.', category: 'Patience' },
    { text: 'Things work out best for those who make the best of how things work out.', category: 'Patience' },
    { text: 'Have faith in the timing of your life.', category: 'Patience' },
    { text: 'You are right on time.', category: 'Patience' },
    { text: 'The longer the wait the sweeter the reward.', category: 'Patience' }
  ] },
  { day: 234, quotes: [
    { text: 'Be patient. Everything comes to you in the right moment.', category: 'Patience' },
    { text: 'Great works are performed not by strength but by perseverance.', category: 'Patience' },
    { text: 'Have patience. All things are difficult before they become easy.', category: 'Patience' },
    { text: 'Where you are is not who you are.', category: 'Patience' },
    { text: 'Believe in the power of yet. You\'re not there yet.', category: 'Patience' }
  ] },
  { day: 235, quotes: [
    { text: 'You are worth more than the sum of your debts.', category: 'Self-Worth' },
    { text: 'Your net worth is not your self-worth.', category: 'Self-Worth' },
    { text: 'You deserve financial peace. Not someday. Now.', category: 'Self-Worth' },
    { text: 'Be proud of how hard you are trying.', category: 'Self-Worth' },
    { text: 'You are not your mistakes. You are the lessons you learn from them.', category: 'Self-Worth' }
  ] },
  { day: 236, quotes: [
    { text: 'Speak to yourself like someone you love.', category: 'Self-Worth' },
    { text: 'You are allowed to be both a masterpiece and a work in progress.', category: 'Self-Worth' },
    { text: 'Investing in yourself is the best investment you will ever make.', category: 'Self-Worth' },
    { text: 'Stop shrinking to fit places you\'ve outgrown.', category: 'Self-Worth' },
    { text: 'Confidence comes from keeping the promises you make to yourself.', category: 'Self-Worth' }
  ] },
  { day: 237, quotes: [
    { text: 'You have survived 100% of your worst days.', category: 'Self-Worth' },
    { text: 'You are the only person who gets to decide what you are worth.', category: 'Self-Worth' },
    { text: 'You already have everything you need to begin.', category: 'Self-Worth' },
    { text: 'Self-care is not selfish. It\'s essential.', category: 'Self-Worth' },
    { text: 'You are the CEO of your life. Start making executive decisions.', category: 'Self-Worth' }
  ] },
  { day: 238, quotes: [
    { text: 'Be gentle with yourself. You\'re doing the best you can.', category: 'Self-Worth' },
    { text: 'What makes you different makes you strong.', category: 'Self-Worth' },
    { text: 'Love yourself enough to set boundaries.', category: 'Self-Worth' },
    { text: 'The most powerful relationship you will ever have is with yourself.', category: 'Self-Worth' },
    { text: 'You didn\'t come this far to be average.', category: 'Self-Worth' }
  ] },
  { day: 239, quotes: [
    { text: 'Owning our story is the bravest thing we\'ll ever do.', category: 'Self-Worth' },
    { text: 'You were not born to just pay bills and die.', category: 'Self-Worth' },
    { text: 'You are one decision away from a completely different life.', category: 'Self-Worth' },
    { text: 'Be so good they can\'t ignore you.', category: 'Self-Worth' },
    { text: 'The world needs who you were made to be.', category: 'Self-Worth' }
  ] },
  { day: 240, quotes: [
    { text: 'Vulnerability is not weakness. It\'s our greatest measure of courage.', category: 'Self-Worth' },
    { text: 'Don\'t let the noise of others\' opinions drown out your inner voice.', category: 'Self-Worth' },
    { text: 'You can\'t pour from an empty cup. Take care of yourself first.', category: 'Self-Worth' },
    { text: 'Stop apologizing for who you are becoming.', category: 'Self-Worth' },
    { text: 'Nobody is going to hit a home run for you. Step up to the plate.', category: 'Self-Worth' }
  ] },
  { day: 241, quotes: [
    { text: 'Gratitude turns what we have into enough.', category: 'Gratitude' },
    { text: 'Be thankful for what you have. You\'ll end up having more.', category: 'Gratitude' },
    { text: 'When you focus on the good the good gets better.', category: 'Gratitude' },
    { text: 'There is always something to be grateful for.', category: 'Gratitude' },
    { text: 'Wake up with determination. Go to bed with satisfaction.', category: 'Gratitude' }
  ] },
  { day: 242, quotes: [
    { text: 'Trade your expectation for appreciation and the world changes.', category: 'Gratitude' },
    { text: 'Appreciate where you are in your journey even if it\'s not where you want to be.', category: 'Gratitude' },
    { text: 'Enjoy the little things. One day you\'ll realize they were the big things.', category: 'Gratitude' },
    { text: 'Today is a good day to have a good day.', category: 'Gratitude' },
    { text: 'Focus on how far you\'ve come not how far you have to go.', category: 'Gratitude' }
  ] },
  { day: 243, quotes: [
    { text: 'Every sunset is an opportunity to reset.', category: 'Gratitude' },
    { text: 'Find joy in the ordinary.', category: 'Gratitude' },
    { text: 'Every day may not be good but there is something good in every day.', category: 'Gratitude' },
    { text: 'Comparison is the thief of joy. Run your own race.', category: 'Gratitude' },
    { text: 'Your struggle is part of your story.', category: 'Gratitude' }
  ] },
  { day: 244, quotes: [
    { text: 'Not all storms come to disrupt your life. Some clear your path.', category: 'Gratitude' },
    { text: 'Perspective is everything.', category: 'Gratitude' },
    { text: 'Happiness is not something ready-made. It comes from your own actions.', category: 'Gratitude' },
    { text: 'Don\'t let things you can\'t control steal your joy.', category: 'Gratitude' },
    { text: 'When you can\'t find the sunshine be the sunshine.', category: 'Gratitude' }
  ] },
  { day: 245, quotes: [
    { text: 'You\'ve already overcome so much. Don\'t forget to celebrate that.', category: 'Gratitude' },
    { text: 'The happiest people make the best of everything.', category: 'Gratitude' },
    { text: 'Count your blessings not your problems.', category: 'Gratitude' },
    { text: 'What if you woke up today with only what you were grateful for yesterday?', category: 'Gratitude' },
    { text: 'Be grateful for every closed door. They guide you to the right one.', category: 'Gratitude' }
  ] },
  { day: 246, quotes: [
    { text: 'Joy is not in things. It is in us.', category: 'Gratitude' },
    { text: 'The real gift of gratitude is that the more grateful you are the more present you become.', category: 'Gratitude' },
    { text: 'Some days you just have to create your own sunshine.', category: 'Gratitude' },
    { text: 'Today\'s tears water tomorrow\'s gardens.', category: 'Gratitude' },
    { text: 'It\'s a beautiful day to be alive.', category: 'Gratitude' }
  ] },
  { day: 247, quotes: [
    { text: 'Every day is a fresh start. Breathe and begin again.', category: 'Fresh Starts' },
    { text: 'Today is the first day of the rest of your life.', category: 'Fresh Starts' },
    { text: 'New beginnings are often disguised as painful endings.', category: 'Fresh Starts' },
    { text: 'Hope is being able to see light despite all the darkness.', category: 'Fresh Starts' },
    { text: 'Tomorrow is another chance to get it right.', category: 'Fresh Starts' }
  ] },
  { day: 248, quotes: [
    { text: 'You can\'t start the next chapter if you keep re-reading the last one.', category: 'Fresh Starts' },
    { text: 'No matter how hard the past you can always begin again.', category: 'Fresh Starts' },
    { text: 'The sun will rise and we will try again.', category: 'Fresh Starts' },
    { text: 'It\'s never too late to become what you might have been.', category: 'Fresh Starts' },
    { text: 'Rock bottom became the solid foundation on which I rebuilt my life.', category: 'Fresh Starts' }
  ] },
  { day: 249, quotes: [
    { text: 'There are far better things ahead than any we leave behind.', category: 'Fresh Starts' },
    { text: 'Today you are one step closer to the life you want.', category: 'Fresh Starts' },
    { text: 'Even the darkest night will end and the sun will rise.', category: 'Fresh Starts' },
    { text: 'The comeback is always stronger than the setback.', category: 'Fresh Starts' },
    { text: 'Let go of what was. Welcome what is.', category: 'Fresh Starts' }
  ] },
  { day: 250, quotes: [
    { text: 'Don\'t look back. You\'re not going that way.', category: 'Fresh Starts' },
    { text: 'The beautiful thing about a new day is the slate is clean.', category: 'Fresh Starts' },
    { text: 'Failure is simply the opportunity to begin again more intelligently.', category: 'Fresh Starts' },
    { text: 'If plan A doesn\'t work the alphabet has 25 more letters.', category: 'Fresh Starts' },
    { text: 'You are never too old to set another goal or dream a new dream.', category: 'Fresh Starts' }
  ] },
  { day: 251, quotes: [
    { text: 'Keep your face always toward the sunshine and shadows will fall behind you.', category: 'Fresh Starts' },
    { text: 'Rise above the storm and you will find the sunshine.', category: 'Fresh Starts' },
    { text: 'Mistakes are proof that you are trying.', category: 'Fresh Starts' },
    { text: 'Create the life you can\'t wait to wake up to.', category: 'Fresh Starts' },
    { text: 'A flower does not compete with the flower next to it. It just blooms.', category: 'Fresh Starts' }
  ] },
  { day: 252, quotes: [
    { text: 'And so the adventure begins.', category: 'Fresh Starts' },
    { text: 'After a storm comes a calm.', category: 'Fresh Starts' },
    { text: 'Every ending is a new beginning.', category: 'Fresh Starts' },
    { text: 'Your life isn\'t behind you. It\'s always in front of you.', category: 'Fresh Starts' },
    { text: 'Wake up every morning thinking something wonderful is about to happen.', category: 'Fresh Starts' }
  ] },
  { day: 253, quotes: [
    { text: 'Life doesn\'t get easier. You get stronger.', category: 'Strength' },
    { text: 'A smooth sea never made a skilled sailor.', category: 'Strength' },
    { text: 'What does not kill us makes us stronger.', category: 'Strength' },
    { text: 'The world breaks everyone and afterward many are strong at the broken places.', category: 'Strength' },
    { text: 'Be like water. It can cut through rock.', category: 'Strength' }
  ] },
  { day: 254, quotes: [
    { text: 'I am not what happened to me. I am what I choose to become.', category: 'Strength' },
    { text: 'Turn your wounds into wisdom.', category: 'Strength' },
    { text: 'Life is tough but so are you.', category: 'Strength' },
    { text: 'A diamond is a chunk of coal that did well under pressure.', category: 'Strength' },
    { text: 'Strength grows in the moments you think you can\'t go on but keep going.', category: 'Strength' }
  ] },
  { day: 255, quotes: [
    { text: 'Pain is temporary. Quitting lasts forever.', category: 'Strength' },
    { text: 'Broken crayons still color.', category: 'Strength' },
    { text: 'You don\'t know how strong you are until being strong is your only choice.', category: 'Strength' },
    { text: 'In the middle of difficulty lies opportunity.', category: 'Strength' },
    { text: 'Tough times don\'t last. Tough people do.', category: 'Strength' }
  ] },
  { day: 256, quotes: [
    { text: 'You are the sky. Everything else is just the weather.', category: 'Strength' },
    { text: 'Steel is forged in fire. Diamonds are made under pressure. So are you.', category: 'Strength' },
    { text: 'I can be changed by what happens to me. But I refuse to be reduced by it.', category: 'Strength' },
    { text: 'Don\'t pray for an easy life. Pray for the strength to endure a difficult one.', category: 'Strength' },
    { text: 'Your hardest times often lead to the greatest moments of your life.', category: 'Strength' }
  ] },
  { day: 257, quotes: [
    { text: 'Where there is no struggle there is no strength.', category: 'Strength' },
    { text: 'Not everything that is faced can be changed but nothing can be changed until it is faced.', category: 'Strength' },
    { text: 'Difficulties in life are intended to make us better not bitter.', category: 'Strength' },
    { text: 'A hero is an ordinary individual who finds the strength to persevere.', category: 'Strength' },
    { text: 'Sometimes you have to get knocked down lower to stand up taller.', category: 'Strength' }
  ] },
  { day: 258, quotes: [
    { text: 'We develop courage by surviving difficult times.', category: 'Strength' },
    { text: 'When the going gets tough the tough get going.', category: 'Strength' },
    { text: 'You may have to fight a battle more than once to win it.', category: 'Strength' },
    { text: 'Scars are just tattoos with better stories.', category: 'Strength' },
    { text: 'You can\'t calm the storm. What you can do is calm yourself.', category: 'Strength' }
  ] },
  { day: 259, quotes: [
    { text: 'You are not your debt. You are the person brave enough to face it.', category: 'Debt Motivation' },
    { text: 'Every dollar toward your balance is a vote for the life you want.', category: 'Debt Motivation' },
    { text: 'Dex says: one payment at a time one day at a time one win at a time.', category: 'Debt Motivation' },
    { text: 'That feeling when your balance is lower than last month? That\'s momentum.', category: 'Debt Motivation' },
    { text: 'Debt doesn\'t define your story. How you handle it does.', category: 'Debt Motivation' }
  ] },
  { day: 260, quotes: [
    { text: 'Today you are closer to zero than you\'ve ever been.', category: 'Debt Motivation' },
    { text: 'Payoff day is coming. Every payment brings it closer.', category: 'Debt Motivation' },
    { text: 'You chose to face this. That already makes you braver than most.', category: 'Debt Motivation' },
    { text: 'Small payments end big debts.', category: 'Debt Motivation' },
    { text: 'Your credit cards don\'t own you. You own your future.', category: 'Debt Motivation' }
  ] },
  { day: 261, quotes: [
    { text: 'The best revenge against debt is a boring consistent payment plan.', category: 'Debt Motivation' },
    { text: 'You\'re playing the long game. Long games always win.', category: 'Debt Motivation' },
    { text: 'Debt payoff is not exciting. It\'s empowering.', category: 'Debt Motivation' },
    { text: 'One less bill. One more breath of freedom.', category: 'Debt Motivation' },
    { text: 'The only bad payment is the one you didn\'t make.', category: 'Debt Motivation' }
  ] },
  { day: 262, quotes: [
    { text: 'Celebrate every milestone. Every hundred dollars paid off matters.', category: 'Debt Motivation' },
    { text: 'This month\'s sacrifice is next year\'s freedom.', category: 'Debt Motivation' },
    { text: 'Financial freedom starts the moment you decide to fight for it.', category: 'Debt Motivation' },
    { text: 'Debt is a chapter not the whole book.', category: 'Debt Motivation' },
    { text: 'The balance goes down. The confidence goes up.', category: 'Debt Motivation' }
  ] },
  { day: 263, quotes: [
    { text: 'Making a payment when money is tight isn\'t easy. It\'s heroic.', category: 'Debt Motivation' },
    { text: 'You\'re doing something most people avoid. That takes guts.', category: 'Debt Motivation' },
    { text: 'Look how far you\'ve come. Now imagine six months from now.', category: 'Debt Motivation' },
    { text: 'Your payoff date isn\'t a dream. It\'s a deadline.', category: 'Debt Motivation' },
    { text: 'Every time you say no to what you can\'t afford you say yes to something bigger.', category: 'Debt Motivation' }
  ] },
  { day: 264, quotes: [
    { text: 'Even on the hard days the balance went down. That counts.', category: 'Debt Motivation' },
    { text: 'One day this will all be a memory. A proud one.', category: 'Debt Motivation' },
    { text: 'You started. That\'s the hardest part. Now just don\'t stop.', category: 'Debt Motivation' },
    { text: 'The spreadsheet doesn\'t lie. You\'re winning.', category: 'Debt Motivation' },
    { text: 'Dex is rooting for you. And so is your future self.', category: 'Debt Motivation' }
  ] },
  { day: 265, quotes: [
    { text: 'You will tell this story someday. Make the ending great.', category: 'Debt Motivation' },
    { text: 'A debt-free life is built in the boring middle. Keep building.', category: 'Debt Motivation' },
    { text: 'Interest is the price of impatience. Patience is your superpower now.', category: 'Debt Motivation' },
    { text: 'You are literally buying your freedom back one payment at a time.', category: 'Debt Motivation' },
    { text: 'When in doubt make a payment.', category: 'Debt Motivation' }
  ] },
  { day: 266, quotes: [
    { text: 'Debt is temporary. The character you build paying it off is permanent.', category: 'Debt Motivation' },
    { text: 'Right now someone with half your income is debt-free because they decided to be.', category: 'Debt Motivation' },
    { text: 'Snowball or avalanche - pick a method and start rolling.', category: 'Debt Motivation' },
    { text: 'There is no pride in being in debt. There is massive pride in getting out.', category: 'Debt Motivation' },
    { text: 'The first rule of getting out of a hole is to stop digging.', category: 'Debt Motivation' }
  ] },
  { day: 267, quotes: [
    { text: 'Live like no one else now so later you can live like no one else.', category: 'Debt Motivation' },
    { text: 'Net worth is built in the boring months. Keep being boring.', category: 'Debt Motivation' },
    { text: 'Your future isn\'t written in your debt balance. It\'s written in your daily decisions.', category: 'Debt Motivation' },
    { text: 'Be weird. Be the person who actually follows a budget.', category: 'Debt Motivation' },
    { text: 'Frugal isn\'t cheap. Frugal is free.', category: 'Debt Motivation' }
  ] },
  { day: 268, quotes: [
    { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', category: 'Action' },
    { text: 'Well done is better than well said.', category: 'Action' },
    { text: 'Stop wishing. Start doing.', category: 'Action' },
    { text: 'You miss 100% of the shots you don\'t take.', category: 'Action' },
    { text: 'Fortune favors the bold.', category: 'Action' }
  ] },
  { day: 269, quotes: [
    { text: 'Get started. The rest will follow.', category: 'Action' },
    { text: 'Do it now. Sometimes later becomes never.', category: 'Action' },
    { text: 'You are what you do not what you say you\'ll do.', category: 'Action' },
    { text: 'Be the hero of your own life.', category: 'Action' },
    { text: 'The path to success is to take massive determined action.', category: 'Action' }
  ] },
  { day: 270, quotes: [
    { text: 'Don\'t wait for opportunity. Create it.', category: 'Action' },
    { text: 'Life rewards those who take action.', category: 'Action' },
    { text: 'Dream it. Believe it. Build it.', category: 'Action' },
    { text: 'Don\'t stop until you\'re proud.', category: 'Action' },
    { text: 'Go the extra mile. It\'s never crowded.', category: 'Action' }
  ] },
  { day: 271, quotes: [
    { text: 'Hard work beats talent when talent doesn\'t work hard.', category: 'Action' },
    { text: 'Opportunities don\'t happen. You create them.', category: 'Action' },
    { text: 'Stay hungry. Stay foolish.', category: 'Action' },
    { text: 'The difference between ordinary and extraordinary is that little extra.', category: 'Action' },
    { text: 'Turn your can\'ts into cans and your dreams into plans.', category: 'Action' }
  ] },
  { day: 272, quotes: [
    { text: 'If it doesn\'t challenge you it doesn\'t change you.', category: 'Action' },
    { text: 'Every champion was once a contender who refused to give up.', category: 'Action' },
    { text: 'Winners are not people who never fail. They are people who never quit.', category: 'Action' },
    { text: 'The harder you work the greater you\'ll feel when you achieve it.', category: 'Action' },
    { text: 'Hustle until you no longer have to introduce yourself.', category: 'Action' }
  ] },
  { day: 273, quotes: [
    { text: 'It\'s going to be hard but hard does not mean impossible.', category: 'Action' },
    { text: 'If you want something you\'ve never had be willing to do what you\'ve never done.', category: 'Action' },
    { text: 'Procrastination is the art of keeping up with yesterday.', category: 'Action' },
    { text: 'Knowledge is of no value unless you put it into practice.', category: 'Action' },
    { text: 'People who say it cannot be done should not interrupt those doing it.', category: 'Action' }
  ] },
  { day: 274, quotes: [
    { text: 'Peace is not the absence of trouble but the presence of calm.', category: 'Peace' },
    { text: 'Almost everything will work again if you unplug it for a few minutes. Including you.', category: 'Peace' },
    { text: 'The greatest wealth is health.', category: 'Peace' },
    { text: 'Rest when you\'re weary. Refresh yourself. Then get back to work.', category: 'Peace' },
    { text: 'Your calm mind is the ultimate weapon against your challenges.', category: 'Peace' }
  ] },
  { day: 275, quotes: [
    { text: 'You owe yourself the love that you so freely give to other people.', category: 'Peace' },
    { text: 'Self-care is how you take your power back.', category: 'Peace' },
    { text: 'Be where you are not where you think you should be.', category: 'Peace' },
    { text: 'Breathe. Let go. This moment is all you have for sure.', category: 'Peace' },
    { text: 'Taking time to do nothing often brings everything into perspective.', category: 'Peace' }
  ] },
  { day: 276, quotes: [
    { text: 'Don\'t trade your peace for a paycheck. Find a way to have both.', category: 'Peace' },
    { text: 'Healing is not linear.', category: 'Peace' },
    { text: 'Happiness is an inside job.', category: 'Peace' },
    { text: 'Inner peace begins when you stop letting others control your emotions.', category: 'Peace' },
    { text: 'Serenity is not freedom from the storm but peace amid the storm.', category: 'Peace' }
  ] },
  { day: 277, quotes: [
    { text: 'You are not a machine. Rest is not a reward. It is a requirement.', category: 'Peace' },
    { text: 'The greatest gift you can give yourself is a little of your own attention.', category: 'Peace' },
    { text: 'Mental health is a process not a destination.', category: 'Peace' },
    { text: 'Don\'t let anxiety steal today because of what might happen tomorrow.', category: 'Peace' },
    { text: 'Sometimes the most productive thing you can do is relax.', category: 'Peace' }
  ] },
  { day: 278, quotes: [
    { text: 'You only live once but if you do it right once is enough.', category: 'Inspiration' },
    { text: 'Try to be a rainbow in someone\'s cloud.', category: 'Inspiration' },
    { text: 'Whatever you are be a good one.', category: 'Inspiration' },
    { text: 'When the world says give up hope whispers try one more time.', category: 'Inspiration' },
    { text: 'Be kind whenever possible. It is always possible.', category: 'Inspiration' }
  ] },
  { day: 279, quotes: [
    { text: 'It is during our darkest moments that we must focus to see the light.', category: 'Inspiration' },
    { text: 'You always pass failure on the way to success.', category: 'Inspiration' },
    { text: 'In a gentle way you can shake the world.', category: 'Inspiration' },
    { text: 'Everything will be okay in the end. If it\'s not okay it\'s not the end.', category: 'Inspiration' },
    { text: 'Stay close to people who feel like sunshine.', category: 'Inspiration' }
  ] },
  { day: 280, quotes: [
    { text: 'Not all who wander are lost.', category: 'Inspiration' },
    { text: 'No rain no flowers.', category: 'Inspiration' },
    { text: 'And still I rise.', category: 'Inspiration' },
    { text: 'Be the energy you want to attract.', category: 'Inspiration' },
    { text: 'The best is yet to come.', category: 'Inspiration' }
  ] },
  { day: 281, quotes: [
    { text: 'Work hard in silence. Let your success be your noise.', category: 'Inspiration' },
    { text: 'She believed she could so she did.', category: 'Inspiration' },
    { text: 'Prove them wrong.', category: 'Inspiration' },
    { text: 'Bloom where you are planted.', category: 'Inspiration' },
    { text: 'Life is either a daring adventure or nothing at all.', category: 'Inspiration' }
  ] },
  { day: 282, quotes: [
    { text: 'Act as if what you do makes a difference. It does.', category: 'Inspiration' },
    { text: 'Every moment is a fresh beginning.', category: 'Inspiration' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', category: 'Inspiration' },
    { text: 'Keep smiling because life is a beautiful thing.', category: 'Inspiration' },
    { text: 'Life is a balance of holding on and letting go.', category: 'Inspiration' }
  ] },
  { day: 283, quotes: [
    { text: 'Every dollar you put toward debt is a dollar invested in your freedom.', category: 'Financial Freedom' },
    { text: 'Debt is the thief of tomorrow\'s choices. Take them back today.', category: 'Financial Freedom' },
    { text: 'Financial freedom isn\'t about being rich. It\'s about having options.', category: 'Financial Freedom' },
    { text: 'The best time to start paying off debt was years ago. The second best is now.', category: 'Financial Freedom' },
    { text: 'You don\'t need a perfect plan. You need a first payment.', category: 'Financial Freedom' }
  ] },
  { day: 284, quotes: [
    { text: 'Money problems are temporary. The habits you build solving them are permanent.', category: 'Financial Freedom' },
    { text: 'Every debt you pay off is a chain you break.', category: 'Financial Freedom' },
    { text: 'Being debt-free isn\'t a destination. It\'s how you travel through life.', category: 'Financial Freedom' },
    { text: 'Wealth isn\'t what you earn. It\'s what you keep after bills are paid.', category: 'Financial Freedom' },
    { text: 'A budget isn\'t a punishment. It\'s permission to spend without guilt.', category: 'Financial Freedom' }
  ] },
  { day: 285, quotes: [
    { text: 'You are not your credit score. But improving it feels great.', category: 'Financial Freedom' },
    { text: 'The interest you\'re not paying is the raise you gave yourself.', category: 'Financial Freedom' },
    { text: 'Financial peace is worth more than anything you could buy on credit.', category: 'Financial Freedom' },
    { text: 'Stop paying for yesterday. Start investing in tomorrow.', category: 'Financial Freedom' },
    { text: 'Every paycheck is a fresh chance to change your financial future.', category: 'Financial Freedom' }
  ] },
  { day: 286, quotes: [
    { text: 'You didn\'t get into debt overnight. You won\'t get out overnight. But you will.', category: 'Financial Freedom' },
    { text: 'The road to financial freedom is paved with boring consistent payments.', category: 'Financial Freedom' },
    { text: 'Your future self will thank you for every sacrifice you make today.', category: 'Financial Freedom' },
    { text: 'Debt is a promise to your past. Freedom is a promise to your future.', category: 'Financial Freedom' },
    { text: 'When you owe nothing everything you earn is yours.', category: 'Financial Freedom' }
  ] },
  { day: 287, quotes: [
    { text: 'A debt-free life isn\'t about deprivation. It\'s about liberation.', category: 'Financial Freedom' },
    { text: 'You\'re not behind. You\'re exactly where your comeback starts.', category: 'Financial Freedom' },
    { text: 'The freedom you want is on the other side of the payments you\'re making.', category: 'Financial Freedom' },
    { text: 'The sacrifice is temporary. The freedom is permanent.', category: 'Financial Freedom' },
    { text: 'Compound interest works against you in debt. Make it work for you in savings.', category: 'Financial Freedom' }
  ] },
  { day: 288, quotes: [
    { text: 'Money is a tool. Debt is a trap. Freedom is the goal.', category: 'Financial Freedom' },
    { text: 'Live below your means today so you can live beyond them tomorrow.', category: 'Financial Freedom' },
    { text: 'The goal isn\'t to be rich. It\'s to be free.', category: 'Financial Freedom' },
    { text: 'Imagine waking up owing nothing. That morning is coming.', category: 'Financial Freedom' },
    { text: 'Broke is temporary. Poor is a mindset. You\'re choosing neither.', category: 'Financial Freedom' }
  ] },
  { day: 289, quotes: [
    { text: 'The best investment you\'ll ever make is paying off what you owe.', category: 'Financial Freedom' },
    { text: 'Every payment is proof that you chose your future over your past.', category: 'Financial Freedom' },
    { text: 'You are closer to debt-free today than you were yesterday.', category: 'Financial Freedom' },
    { text: 'Budgeting is telling your money where to go instead of wondering where it went.', category: 'Financial Freedom' },
    { text: 'The gap between your income and your spending is where freedom lives.', category: 'Financial Freedom' }
  ] },
  { day: 290, quotes: [
    { text: 'Your financial story isn\'t over. This is just the plot twist.', category: 'Financial Freedom' },
    { text: 'Don\'t compare your chapter one to someone else\'s chapter twenty.', category: 'Financial Freedom' },
    { text: 'Financial freedom is the ultimate form of self-care.', category: 'Financial Freedom' },
    { text: 'Money doesn\'t buy happiness but being free from debt buys peace.', category: 'Financial Freedom' },
    { text: 'There\'s no shame in having debt. There\'s power in deciding to end it.', category: 'Financial Freedom' }
  ] },
  { day: 291, quotes: [
    { text: 'Fall seven times stand up eight.', category: 'Perseverance' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', category: 'Perseverance' },
    { text: 'The only way out is through. Keep going.', category: 'Perseverance' },
    { text: 'Success is not final failure is not fatal: it is the courage to continue that counts.', category: 'Perseverance' },
    { text: 'A river cuts through rock not by power but by persistence.', category: 'Perseverance' }
  ] },
  { day: 292, quotes: [
    { text: 'You haven\'t come this far to only come this far.', category: 'Perseverance' },
    { text: 'Difficult roads often lead to beautiful destinations.', category: 'Perseverance' },
    { text: 'When you feel like quitting remember why you started.', category: 'Perseverance' },
    { text: 'The struggle you\'re in today is developing the strength you need for tomorrow.', category: 'Perseverance' },
    { text: 'Every setback is a setup for a comeback.', category: 'Perseverance' }
  ] },
  { day: 293, quotes: [
    { text: 'The moment you\'re ready to quit is usually right before a breakthrough.', category: 'Perseverance' },
    { text: 'Progress not perfection is what matters.', category: 'Perseverance' },
    { text: 'It always seems impossible until it\'s done.', category: 'Perseverance' },
    { text: 'If you\'re going through hell keep going.', category: 'Perseverance' },
    { text: 'The pain you feel today will be the strength you feel tomorrow.', category: 'Perseverance' }
  ] },
  { day: 294, quotes: [
    { text: 'Tough times never last but tough people do.', category: 'Perseverance' },
    { text: 'Small progress is still progress.', category: 'Perseverance' },
    { text: 'Storms make trees take deeper roots.', category: 'Perseverance' },
    { text: 'Your current situation is not your final destination.', category: 'Perseverance' },
    { text: 'You are braver than you believe stronger than you seem smarter than you think.', category: 'Perseverance' }
  ] },
  { day: 295, quotes: [
    { text: 'Most people give up just when they\'re about to achieve success.', category: 'Perseverance' },
    { text: 'Stars can\'t shine without darkness.', category: 'Perseverance' },
    { text: 'Keep planting. Keep watering. The harvest is coming.', category: 'Perseverance' },
    { text: 'Don\'t watch the clock. Do what it does. Keep going.', category: 'Perseverance' },
    { text: 'Champions keep playing until they get it right.', category: 'Perseverance' }
  ] },
  { day: 296, quotes: [
    { text: 'Patience and perseverance have a magical effect before which difficulties disappear.', category: 'Perseverance' },
    { text: 'The darkest hour has only sixty minutes.', category: 'Perseverance' },
    { text: 'Courage doesn\'t always roar. Sometimes it\'s the quiet voice saying I will try again tomorrow.', category: 'Perseverance' },
    { text: 'Push yourself because no one else is going to do it for you.', category: 'Perseverance' },
    { text: 'The human spirit is stronger than anything that can happen to it.', category: 'Perseverance' }
  ] },
  { day: 297, quotes: [
    { text: 'Endurance is not just bearing a hard thing but turning it into glory.', category: 'Perseverance' },
    { text: 'You were given this life because you are strong enough to live it.', category: 'Perseverance' },
    { text: 'Hardships often prepare ordinary people for an extraordinary destiny.', category: 'Perseverance' },
    { text: 'One day you\'ll tell your story and it will become someone else\'s survival guide.', category: 'Perseverance' },
    { text: 'When everything seems against you remember airplanes take off against the wind.', category: 'Perseverance' }
  ] },
  { day: 298, quotes: [
    { text: 'Persistence can change failure into extraordinary achievement.', category: 'Perseverance' },
    { text: 'The oak fought the wind and was broken. The willow bent and survived.', category: 'Perseverance' },
    { text: 'Don\'t be discouraged. It\'s often the last key that opens the lock.', category: 'Perseverance' },
    { text: 'Not every day will be good. But there is good in every day.', category: 'Perseverance' },
    { text: 'Success is stumbling from failure to failure with no loss of enthusiasm.', category: 'Perseverance' }
  ] },
  { day: 299, quotes: [
    { text: 'Discipline is choosing between what you want now and what you want most.', category: 'Discipline' },
    { text: 'We are what we repeatedly do. Excellence is not an act but a habit.', category: 'Discipline' },
    { text: 'Motivation gets you started. Habit keeps you going.', category: 'Discipline' },
    { text: 'The secret of your success is found in your daily routine.', category: 'Discipline' },
    { text: 'You\'ll never change your life until you change something you do daily.', category: 'Discipline' }
  ] },
  { day: 300, quotes: [
    { text: 'Success isn\'t always about greatness. It\'s about consistency.', category: 'Discipline' },
    { text: 'Self-discipline is the bridge between goals and accomplishment.', category: 'Discipline' },
    { text: 'Don\'t break the chain. One day at a time.', category: 'Discipline' },
    { text: 'What you do every day matters more than what you do once in a while.', category: 'Discipline' },
    { text: 'Habits are the compound interest of self-improvement.', category: 'Discipline' }
  ] },
  { day: 301, quotes: [
    { text: 'The price of discipline is always less than the pain of regret.', category: 'Discipline' },
    { text: 'One percent better every day. That\'s 37 times better in a year.', category: 'Discipline' },
    { text: 'You don\'t rise to the level of your goals. You fall to the level of your systems.', category: 'Discipline' },
    { text: 'Nothing will work unless you do.', category: 'Discipline' },
    { text: 'Dripping water hollows out stone not through force but through persistence.', category: 'Discipline' }
  ] },
  { day: 302, quotes: [
    { text: 'Don\'t count the days. Make the days count.', category: 'Discipline' },
    { text: 'Start where you are. Use what you have. Do what you can.', category: 'Discipline' },
    { text: 'Don\'t wait for motivation. Create momentum.', category: 'Discipline' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', category: 'Discipline' },
    { text: 'Make each day your masterpiece.', category: 'Discipline' }
  ] },
  { day: 303, quotes: [
    { text: 'Drop by drop the bucket fills.', category: 'Discipline' },
    { text: 'The difference between who you are and who you want to be is what you do.', category: 'Discipline' },
    { text: 'First we form habits then they form us.', category: 'Discipline' },
    { text: 'Your daily choices are shaping your future right now.', category: 'Discipline' },
    { text: 'Routine is liberation. When habits are automatic willpower is free.', category: 'Discipline' }
  ] },
  { day: 304, quotes: [
    { text: 'The best way to predict your future is to create it.', category: 'Discipline' },
    { text: 'Discipline is remembering what you want.', category: 'Discipline' },
    { text: 'Little by little one travels far.', category: 'Discipline' },
    { text: 'An ounce of action is worth a ton of theory.', category: 'Discipline' },
    { text: 'Small disciplines repeated with consistency lead to great achievements.', category: 'Discipline' }
  ] },
  { day: 305, quotes: [
    { text: 'Do what is hard and your life will be easy.', category: 'Discipline' },
    { text: 'Automate the good. Eliminate the bad. That\'s the whole system.', category: 'Discipline' },
    { text: 'Energy and persistence conquer all things.', category: 'Discipline' },
    { text: 'Your habits are the architects of your destiny.', category: 'Discipline' },
    { text: 'Consistency is the true foundation of trust.', category: 'Discipline' }
  ] },
  { day: 306, quotes: [
    { text: 'The power of small wins cannot be overstated.', category: 'Discipline' },
    { text: 'Be patient with yourself. Self-growth is tender.', category: 'Discipline' },
    { text: 'What seems like overnight success is usually years of consistent work.', category: 'Discipline' },
    { text: 'When you master your habits you master your life.', category: 'Discipline' },
    { text: 'Repetition is the mother of learning and the architect of accomplishment.', category: 'Discipline' }
  ] },
  { day: 307, quotes: [
    { text: 'Whether you think you can or you think you can\'t you\'re right.', category: 'Mindset' },
    { text: 'Your mind is a garden. Your thoughts are the seeds.', category: 'Mindset' },
    { text: 'Change your thoughts and you change your world.', category: 'Mindset' },
    { text: 'Believe you can and you\'re halfway there.', category: 'Mindset' },
    { text: 'What you focus on expands. Focus on solutions.', category: 'Mindset' }
  ] },
  { day: 308, quotes: [
    { text: 'The mind is everything. What you think you become.', category: 'Mindset' },
    { text: 'Everything you\'ve ever wanted is on the other side of fear.', category: 'Mindset' },
    { text: 'Life is 10% what happens to you and 90% how you react to it.', category: 'Mindset' },
    { text: 'You are capable of more than you know.', category: 'Mindset' },
    { text: 'Doubt kills more dreams than failure ever will.', category: 'Mindset' }
  ] },
  { day: 309, quotes: [
    { text: 'The way you speak to yourself matters. Be kind.', category: 'Mindset' },
    { text: 'Don\'t let yesterday take up too much of today.', category: 'Mindset' },
    { text: 'Your life does not get better by chance. It gets better by change.', category: 'Mindset' },
    { text: 'Everything is figureoutable.', category: 'Mindset' },
    { text: 'You can\'t go back and change the beginning but you can start where you are.', category: 'Mindset' }
  ] },
  { day: 310, quotes: [
    { text: 'A calm mind brings inner strength and self-confidence.', category: 'Mindset' },
    { text: 'Impossible is just an opinion.', category: 'Mindset' },
    { text: 'The way to get started is to quit talking and begin doing.', category: 'Mindset' },
    { text: 'Challenges make life interesting. Overcoming them makes life meaningful.', category: 'Mindset' },
    { text: 'Be stubborn about your goals and flexible about your methods.', category: 'Mindset' }
  ] },
  { day: 311, quotes: [
    { text: 'Where focus goes energy flows.', category: 'Mindset' },
    { text: 'Strength comes from overcoming what you thought you couldn\'t.', category: 'Mindset' },
    { text: 'You are enough just as you are. And getting better every day.', category: 'Mindset' },
    { text: 'Stop being afraid of what could go wrong. Be excited about what could go right.', category: 'Mindset' },
    { text: 'Every morning you choose: sleep with dreams or wake up and chase them.', category: 'Mindset' }
  ] },
  { day: 312, quotes: [
    { text: 'Your attitude determines your direction.', category: 'Mindset' },
    { text: 'Don\'t limit your challenges. Challenge your limits.', category: 'Mindset' },
    { text: 'The only person you are destined to become is the person you decide to be.', category: 'Mindset' },
    { text: 'Worrying does not take away tomorrow\'s troubles. It takes away today\'s peace.', category: 'Mindset' },
    { text: 'Your potential is endless.', category: 'Mindset' }
  ] },
  { day: 313, quotes: [
    { text: 'Limitations live only in our minds.', category: 'Mindset' },
    { text: 'Our greatest glory is not in never falling but in rising every time we fall.', category: 'Mindset' },
    { text: 'What consumes your mind controls your life.', category: 'Mindset' },
    { text: 'Thinking will not overcome fear but action will.', category: 'Mindset' },
    { text: 'No one can make you feel inferior without your consent.', category: 'Mindset' }
  ] },
  { day: 314, quotes: [
    { text: 'The biggest risk is not taking any risk.', category: 'Mindset' },
    { text: 'You were born to be real not to be perfect.', category: 'Mindset' },
    { text: 'Your beliefs become your thoughts. Your thoughts become your actions.', category: 'Mindset' },
    { text: 'The greatest discovery is that you can change your future by changing your attitude.', category: 'Mindset' },
    { text: 'Positive thinking lets you do everything better than negative thinking will.', category: 'Mindset' }
  ] },
  { day: 315, quotes: [
    { text: 'A journey of a thousand miles begins with a single step.', category: 'Small Steps' },
    { text: 'Big things are built one small piece at a time.', category: 'Small Steps' },
    { text: 'Progress is progress no matter how small.', category: 'Small Steps' },
    { text: 'Every expert was once a beginner.', category: 'Small Steps' },
    { text: 'The only impossible journey is the one you never begin.', category: 'Small Steps' }
  ] },
  { day: 316, quotes: [
    { text: 'A year from now you\'ll wish you had started today.', category: 'Small Steps' },
    { text: 'Your future is created by what you do today not tomorrow.', category: 'Small Steps' },
    { text: 'Step by step. Day by day. Payment by payment.', category: 'Small Steps' },
    { text: 'Focus on the step in front of you not the whole staircase.', category: 'Small Steps' },
    { text: 'Small wins fuel big victories.', category: 'Small Steps' }
  ] },
  { day: 317, quotes: [
    { text: 'One step at a time is still walking.', category: 'Small Steps' },
    { text: 'The compound effect of tiny daily improvements is remarkable.', category: 'Small Steps' },
    { text: 'The secret of getting ahead is getting started.', category: 'Small Steps' },
    { text: 'Do something today that your future self will thank you for.', category: 'Small Steps' },
    { text: 'Think big start small act now.', category: 'Small Steps' }
  ] },
  { day: 318, quotes: [
    { text: 'Every accomplishment starts with the decision to try.', category: 'Small Steps' },
    { text: 'Begin wherever you are and start taking action.', category: 'Small Steps' },
    { text: 'An ant can carry fifty times its own weight. You can carry more than you think.', category: 'Small Steps' },
    { text: 'Great things are done by a series of small things brought together.', category: 'Small Steps' },
    { text: 'You are making progress even on the days it doesn\'t feel like it.', category: 'Small Steps' }
  ] },
  { day: 319, quotes: [
    { text: 'Not all steps forward are big. But they all move you closer.', category: 'Small Steps' },
    { text: 'Movement in any direction is better than standing still.', category: 'Small Steps' },
    { text: 'The beginning is always today.', category: 'Small Steps' },
    { text: 'Little strokes fell great oaks.', category: 'Small Steps' },
    { text: 'The man who moves a mountain begins by carrying away small stones.', category: 'Small Steps' }
  ] },
  { day: 320, quotes: [
    { text: 'You don\'t have to be extreme. Just consistent.', category: 'Small Steps' },
    { text: 'Inch by inch anything\'s a cinch.', category: 'Small Steps' },
    { text: 'Steady progress is better than sudden perfection.', category: 'Small Steps' },
    { text: 'Don\'t overwhelm yourself with the big picture. Focus on the next right step.', category: 'Small Steps' },
    { text: 'Ten minutes of action beats ten hours of planning.', category: 'Small Steps' }
  ] },
  { day: 321, quotes: [
    { text: 'Never underestimate the power of small beginnings.', category: 'Small Steps' },
    { text: 'Take it one day at a time. That\'s all anyone can do.', category: 'Small Steps' },
    { text: 'What you do today is important because you\'re exchanging a day of your life for it.', category: 'Small Steps' },
    { text: 'The shortest way to do many things is to do one thing at a time.', category: 'Small Steps' },
    { text: 'Tomorrow becomes never. Take the first step now.', category: 'Small Steps' }
  ] },
  { day: 322, quotes: [
    { text: 'Plant seeds of effort today; harvest success tomorrow.', category: 'Small Steps' },
    { text: 'You eat an elephant one bite at a time.', category: 'Small Steps' },
    { text: 'Success is a series of small wins stacked on top of each other.', category: 'Small Steps' },
    { text: 'Don\'t wait for the perfect moment. Take the moment and make it perfect.', category: 'Small Steps' },
    { text: 'A small positive step is better than a large step in no direction.', category: 'Small Steps' }
  ] },
  { day: 323, quotes: [
    { text: 'Patience is not the ability to wait but to keep a good attitude while waiting.', category: 'Patience' },
    { text: 'Trust the process. Results come to those who earn them.', category: 'Patience' },
    { text: 'Nature does not hurry yet everything is accomplished.', category: 'Patience' },
    { text: 'Slow and steady wins the race.', category: 'Patience' },
    { text: 'Don\'t rush the process. Good things take time.', category: 'Patience' }
  ] },
  { day: 324, quotes: [
    { text: 'Patience is bitter but its fruit is sweet.', category: 'Patience' },
    { text: 'Your time is coming. Just keep doing the work.', category: 'Patience' },
    { text: 'Growth is silent. You won\'t hear it but you\'ll feel it.', category: 'Patience' },
    { text: 'Rest if you must but don\'t quit.', category: 'Patience' },
    { text: 'Success is a marathon not a sprint.', category: 'Patience' }
  ] },
  { day: 325, quotes: [
    { text: 'Seeds don\'t become trees overnight.', category: 'Patience' },
    { text: 'The oak tree was once a little nut that held its ground.', category: 'Patience' },
    { text: 'Progress takes patience. Give yourself grace.', category: 'Patience' },
    { text: 'Delays are not denials.', category: 'Patience' },
    { text: 'What feels slow now is building something that will last.', category: 'Patience' }
  ] },
  { day: 326, quotes: [
    { text: 'Trust the wait. Embrace the uncertainty.', category: 'Patience' },
    { text: 'Even flowers need time to bloom.', category: 'Patience' },
    { text: 'Patience is the companion of wisdom.', category: 'Patience' },
    { text: 'Adopt the pace of nature: her secret is patience.', category: 'Patience' },
    { text: 'All in good time. Just keep showing up.', category: 'Patience' }
  ] },
  { day: 327, quotes: [
    { text: 'Everything is hard before it is easy.', category: 'Patience' },
    { text: 'Things work out best for those who make the best of how things work out.', category: 'Patience' },
    { text: 'Have faith in the timing of your life.', category: 'Patience' },
    { text: 'You are right on time.', category: 'Patience' },
    { text: 'The longer the wait the sweeter the reward.', category: 'Patience' }
  ] },
  { day: 328, quotes: [
    { text: 'Be patient. Everything comes to you in the right moment.', category: 'Patience' },
    { text: 'Great works are performed not by strength but by perseverance.', category: 'Patience' },
    { text: 'Have patience. All things are difficult before they become easy.', category: 'Patience' },
    { text: 'Where you are is not who you are.', category: 'Patience' },
    { text: 'Believe in the power of yet. You\'re not there yet.', category: 'Patience' }
  ] },
  { day: 329, quotes: [
    { text: 'You are worth more than the sum of your debts.', category: 'Self-Worth' },
    { text: 'Your net worth is not your self-worth.', category: 'Self-Worth' },
    { text: 'You deserve financial peace. Not someday. Now.', category: 'Self-Worth' },
    { text: 'Be proud of how hard you are trying.', category: 'Self-Worth' },
    { text: 'You are not your mistakes. You are the lessons you learn from them.', category: 'Self-Worth' }
  ] },
  { day: 330, quotes: [
    { text: 'Speak to yourself like someone you love.', category: 'Self-Worth' },
    { text: 'You are allowed to be both a masterpiece and a work in progress.', category: 'Self-Worth' },
    { text: 'Investing in yourself is the best investment you will ever make.', category: 'Self-Worth' },
    { text: 'Stop shrinking to fit places you\'ve outgrown.', category: 'Self-Worth' },
    { text: 'Confidence comes from keeping the promises you make to yourself.', category: 'Self-Worth' }
  ] },
  { day: 331, quotes: [
    { text: 'You have survived 100% of your worst days.', category: 'Self-Worth' },
    { text: 'You are the only person who gets to decide what you are worth.', category: 'Self-Worth' },
    { text: 'You already have everything you need to begin.', category: 'Self-Worth' },
    { text: 'Self-care is not selfish. It\'s essential.', category: 'Self-Worth' },
    { text: 'You are the CEO of your life. Start making executive decisions.', category: 'Self-Worth' }
  ] },
  { day: 332, quotes: [
    { text: 'Be gentle with yourself. You\'re doing the best you can.', category: 'Self-Worth' },
    { text: 'What makes you different makes you strong.', category: 'Self-Worth' },
    { text: 'Love yourself enough to set boundaries.', category: 'Self-Worth' },
    { text: 'The most powerful relationship you will ever have is with yourself.', category: 'Self-Worth' },
    { text: 'You didn\'t come this far to be average.', category: 'Self-Worth' }
  ] },
  { day: 333, quotes: [
    { text: 'Owning our story is the bravest thing we\'ll ever do.', category: 'Self-Worth' },
    { text: 'You were not born to just pay bills and die.', category: 'Self-Worth' },
    { text: 'You are one decision away from a completely different life.', category: 'Self-Worth' },
    { text: 'Be so good they can\'t ignore you.', category: 'Self-Worth' },
    { text: 'The world needs who you were made to be.', category: 'Self-Worth' }
  ] },
  { day: 334, quotes: [
    { text: 'Vulnerability is not weakness. It\'s our greatest measure of courage.', category: 'Self-Worth' },
    { text: 'Don\'t let the noise of others\' opinions drown out your inner voice.', category: 'Self-Worth' },
    { text: 'You can\'t pour from an empty cup. Take care of yourself first.', category: 'Self-Worth' },
    { text: 'Stop apologizing for who you are becoming.', category: 'Self-Worth' },
    { text: 'Nobody is going to hit a home run for you. Step up to the plate.', category: 'Self-Worth' }
  ] },
  { day: 335, quotes: [
    { text: 'Gratitude turns what we have into enough.', category: 'Gratitude' },
    { text: 'Be thankful for what you have. You\'ll end up having more.', category: 'Gratitude' },
    { text: 'When you focus on the good the good gets better.', category: 'Gratitude' },
    { text: 'There is always something to be grateful for.', category: 'Gratitude' },
    { text: 'Wake up with determination. Go to bed with satisfaction.', category: 'Gratitude' }
  ] },
  { day: 336, quotes: [
    { text: 'Trade your expectation for appreciation and the world changes.', category: 'Gratitude' },
    { text: 'Appreciate where you are in your journey even if it\'s not where you want to be.', category: 'Gratitude' },
    { text: 'Enjoy the little things. One day you\'ll realize they were the big things.', category: 'Gratitude' },
    { text: 'Today is a good day to have a good day.', category: 'Gratitude' },
    { text: 'Focus on how far you\'ve come not how far you have to go.', category: 'Gratitude' }
  ] },
  { day: 337, quotes: [
    { text: 'Every sunset is an opportunity to reset.', category: 'Gratitude' },
    { text: 'Find joy in the ordinary.', category: 'Gratitude' },
    { text: 'Every day may not be good but there is something good in every day.', category: 'Gratitude' },
    { text: 'Comparison is the thief of joy. Run your own race.', category: 'Gratitude' },
    { text: 'Your struggle is part of your story.', category: 'Gratitude' }
  ] },
  { day: 338, quotes: [
    { text: 'Not all storms come to disrupt your life. Some clear your path.', category: 'Gratitude' },
    { text: 'Perspective is everything.', category: 'Gratitude' },
    { text: 'Happiness is not something ready-made. It comes from your own actions.', category: 'Gratitude' },
    { text: 'Don\'t let things you can\'t control steal your joy.', category: 'Gratitude' },
    { text: 'When you can\'t find the sunshine be the sunshine.', category: 'Gratitude' }
  ] },
  { day: 339, quotes: [
    { text: 'You\'ve already overcome so much. Don\'t forget to celebrate that.', category: 'Gratitude' },
    { text: 'The happiest people make the best of everything.', category: 'Gratitude' },
    { text: 'Count your blessings not your problems.', category: 'Gratitude' },
    { text: 'What if you woke up today with only what you were grateful for yesterday?', category: 'Gratitude' },
    { text: 'Be grateful for every closed door. They guide you to the right one.', category: 'Gratitude' }
  ] },
  { day: 340, quotes: [
    { text: 'Joy is not in things. It is in us.', category: 'Gratitude' },
    { text: 'The real gift of gratitude is that the more grateful you are the more present you become.', category: 'Gratitude' },
    { text: 'Some days you just have to create your own sunshine.', category: 'Gratitude' },
    { text: 'Today\'s tears water tomorrow\'s gardens.', category: 'Gratitude' },
    { text: 'It\'s a beautiful day to be alive.', category: 'Gratitude' }
  ] },
  { day: 341, quotes: [
    { text: 'Every day is a fresh start. Breathe and begin again.', category: 'Fresh Starts' },
    { text: 'Today is the first day of the rest of your life.', category: 'Fresh Starts' },
    { text: 'New beginnings are often disguised as painful endings.', category: 'Fresh Starts' },
    { text: 'Hope is being able to see light despite all the darkness.', category: 'Fresh Starts' },
    { text: 'Tomorrow is another chance to get it right.', category: 'Fresh Starts' }
  ] },
  { day: 342, quotes: [
    { text: 'You can\'t start the next chapter if you keep re-reading the last one.', category: 'Fresh Starts' },
    { text: 'No matter how hard the past you can always begin again.', category: 'Fresh Starts' },
    { text: 'The sun will rise and we will try again.', category: 'Fresh Starts' },
    { text: 'It\'s never too late to become what you might have been.', category: 'Fresh Starts' },
    { text: 'Rock bottom became the solid foundation on which I rebuilt my life.', category: 'Fresh Starts' }
  ] },
  { day: 343, quotes: [
    { text: 'There are far better things ahead than any we leave behind.', category: 'Fresh Starts' },
    { text: 'Today you are one step closer to the life you want.', category: 'Fresh Starts' },
    { text: 'Even the darkest night will end and the sun will rise.', category: 'Fresh Starts' },
    { text: 'The comeback is always stronger than the setback.', category: 'Fresh Starts' },
    { text: 'Let go of what was. Welcome what is.', category: 'Fresh Starts' }
  ] },
  { day: 344, quotes: [
    { text: 'Don\'t look back. You\'re not going that way.', category: 'Fresh Starts' },
    { text: 'The beautiful thing about a new day is the slate is clean.', category: 'Fresh Starts' },
    { text: 'Failure is simply the opportunity to begin again more intelligently.', category: 'Fresh Starts' },
    { text: 'If plan A doesn\'t work the alphabet has 25 more letters.', category: 'Fresh Starts' },
    { text: 'You are never too old to set another goal or dream a new dream.', category: 'Fresh Starts' }
  ] },
  { day: 345, quotes: [
    { text: 'Keep your face always toward the sunshine and shadows will fall behind you.', category: 'Fresh Starts' },
    { text: 'Rise above the storm and you will find the sunshine.', category: 'Fresh Starts' },
    { text: 'Mistakes are proof that you are trying.', category: 'Fresh Starts' },
    { text: 'Create the life you can\'t wait to wake up to.', category: 'Fresh Starts' },
    { text: 'A flower does not compete with the flower next to it. It just blooms.', category: 'Fresh Starts' }
  ] },
  { day: 346, quotes: [
    { text: 'And so the adventure begins.', category: 'Fresh Starts' },
    { text: 'After a storm comes a calm.', category: 'Fresh Starts' },
    { text: 'Every ending is a new beginning.', category: 'Fresh Starts' },
    { text: 'Your life isn\'t behind you. It\'s always in front of you.', category: 'Fresh Starts' },
    { text: 'Wake up every morning thinking something wonderful is about to happen.', category: 'Fresh Starts' }
  ] },
  { day: 347, quotes: [
    { text: 'Life doesn\'t get easier. You get stronger.', category: 'Strength' },
    { text: 'A smooth sea never made a skilled sailor.', category: 'Strength' },
    { text: 'What does not kill us makes us stronger.', category: 'Strength' },
    { text: 'The world breaks everyone and afterward many are strong at the broken places.', category: 'Strength' },
    { text: 'Be like water. It can cut through rock.', category: 'Strength' }
  ] },
  { day: 348, quotes: [
    { text: 'I am not what happened to me. I am what I choose to become.', category: 'Strength' },
    { text: 'Turn your wounds into wisdom.', category: 'Strength' },
    { text: 'Life is tough but so are you.', category: 'Strength' },
    { text: 'A diamond is a chunk of coal that did well under pressure.', category: 'Strength' },
    { text: 'Strength grows in the moments you think you can\'t go on but keep going.', category: 'Strength' }
  ] },
  { day: 349, quotes: [
    { text: 'Pain is temporary. Quitting lasts forever.', category: 'Strength' },
    { text: 'Broken crayons still color.', category: 'Strength' },
    { text: 'You don\'t know how strong you are until being strong is your only choice.', category: 'Strength' },
    { text: 'In the middle of difficulty lies opportunity.', category: 'Strength' },
    { text: 'Tough times don\'t last. Tough people do.', category: 'Strength' }
  ] },
  { day: 350, quotes: [
    { text: 'You are the sky. Everything else is just the weather.', category: 'Strength' },
    { text: 'Steel is forged in fire. Diamonds are made under pressure. So are you.', category: 'Strength' },
    { text: 'I can be changed by what happens to me. But I refuse to be reduced by it.', category: 'Strength' },
    { text: 'Don\'t pray for an easy life. Pray for the strength to endure a difficult one.', category: 'Strength' },
    { text: 'Your hardest times often lead to the greatest moments of your life.', category: 'Strength' }
  ] },
  { day: 351, quotes: [
    { text: 'Where there is no struggle there is no strength.', category: 'Strength' },
    { text: 'Not everything that is faced can be changed but nothing can be changed until it is faced.', category: 'Strength' },
    { text: 'Difficulties in life are intended to make us better not bitter.', category: 'Strength' },
    { text: 'A hero is an ordinary individual who finds the strength to persevere.', category: 'Strength' },
    { text: 'Sometimes you have to get knocked down lower to stand up taller.', category: 'Strength' }
  ] },
  { day: 352, quotes: [
    { text: 'We develop courage by surviving difficult times.', category: 'Strength' },
    { text: 'When the going gets tough the tough get going.', category: 'Strength' },
    { text: 'You may have to fight a battle more than once to win it.', category: 'Strength' },
    { text: 'Scars are just tattoos with better stories.', category: 'Strength' },
    { text: 'You can\'t calm the storm. What you can do is calm yourself.', category: 'Strength' }
  ] },
  { day: 353, quotes: [
    { text: 'You are not your debt. You are the person brave enough to face it.', category: 'Debt Motivation' },
    { text: 'Every dollar toward your balance is a vote for the life you want.', category: 'Debt Motivation' },
    { text: 'Dex says: one payment at a time one day at a time one win at a time.', category: 'Debt Motivation' },
    { text: 'That feeling when your balance is lower than last month? That\'s momentum.', category: 'Debt Motivation' },
    { text: 'Debt doesn\'t define your story. How you handle it does.', category: 'Debt Motivation' }
  ] },
  { day: 354, quotes: [
    { text: 'Today you are closer to zero than you\'ve ever been.', category: 'Debt Motivation' },
    { text: 'Payoff day is coming. Every payment brings it closer.', category: 'Debt Motivation' },
    { text: 'You chose to face this. That already makes you braver than most.', category: 'Debt Motivation' },
    { text: 'Small payments end big debts.', category: 'Debt Motivation' },
    { text: 'Your credit cards don\'t own you. You own your future.', category: 'Debt Motivation' }
  ] },
  { day: 355, quotes: [
    { text: 'The best revenge against debt is a boring consistent payment plan.', category: 'Debt Motivation' },
    { text: 'You\'re playing the long game. Long games always win.', category: 'Debt Motivation' },
    { text: 'Debt payoff is not exciting. It\'s empowering.', category: 'Debt Motivation' },
    { text: 'One less bill. One more breath of freedom.', category: 'Debt Motivation' },
    { text: 'The only bad payment is the one you didn\'t make.', category: 'Debt Motivation' }
  ] },
  { day: 356, quotes: [
    { text: 'Celebrate every milestone. Every hundred dollars paid off matters.', category: 'Debt Motivation' },
    { text: 'This month\'s sacrifice is next year\'s freedom.', category: 'Debt Motivation' },
    { text: 'Financial freedom starts the moment you decide to fight for it.', category: 'Debt Motivation' },
    { text: 'Debt is a chapter not the whole book.', category: 'Debt Motivation' },
    { text: 'The balance goes down. The confidence goes up.', category: 'Debt Motivation' }
  ] },
  { day: 357, quotes: [
    { text: 'Making a payment when money is tight isn\'t easy. It\'s heroic.', category: 'Debt Motivation' },
    { text: 'You\'re doing something most people avoid. That takes guts.', category: 'Debt Motivation' },
    { text: 'Look how far you\'ve come. Now imagine six months from now.', category: 'Debt Motivation' },
    { text: 'Your payoff date isn\'t a dream. It\'s a deadline.', category: 'Debt Motivation' },
    { text: 'Every time you say no to what you can\'t afford you say yes to something bigger.', category: 'Debt Motivation' }
  ] },
  { day: 358, quotes: [
    { text: 'Even on the hard days the balance went down. That counts.', category: 'Debt Motivation' },
    { text: 'One day this will all be a memory. A proud one.', category: 'Debt Motivation' },
    { text: 'You started. That\'s the hardest part. Now just don\'t stop.', category: 'Debt Motivation' },
    { text: 'The spreadsheet doesn\'t lie. You\'re winning.', category: 'Debt Motivation' },
    { text: 'Dex is rooting for you. And so is your future self.', category: 'Debt Motivation' }
  ] },
  { day: 359, quotes: [
    { text: 'You will tell this story someday. Make the ending great.', category: 'Debt Motivation' },
    { text: 'A debt-free life is built in the boring middle. Keep building.', category: 'Debt Motivation' },
    { text: 'Interest is the price of impatience. Patience is your superpower now.', category: 'Debt Motivation' },
    { text: 'You are literally buying your freedom back one payment at a time.', category: 'Debt Motivation' },
    { text: 'When in doubt make a payment.', category: 'Debt Motivation' }
  ] },
  { day: 360, quotes: [
    { text: 'Debt is temporary. The character you build paying it off is permanent.', category: 'Debt Motivation' },
    { text: 'Right now someone with half your income is debt-free because they decided to be.', category: 'Debt Motivation' },
    { text: 'Snowball or avalanche - pick a method and start rolling.', category: 'Debt Motivation' },
    { text: 'There is no pride in being in debt. There is massive pride in getting out.', category: 'Debt Motivation' },
    { text: 'The first rule of getting out of a hole is to stop digging.', category: 'Debt Motivation' }
  ] },
  { day: 361, quotes: [
    { text: 'Live like no one else now so later you can live like no one else.', category: 'Debt Motivation' },
    { text: 'Net worth is built in the boring months. Keep being boring.', category: 'Debt Motivation' },
    { text: 'Your future isn\'t written in your debt balance. It\'s written in your daily decisions.', category: 'Debt Motivation' },
    { text: 'Be weird. Be the person who actually follows a budget.', category: 'Debt Motivation' },
    { text: 'Frugal isn\'t cheap. Frugal is free.', category: 'Debt Motivation' }
  ] },
  { day: 362, quotes: [
    { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', category: 'Action' },
    { text: 'Well done is better than well said.', category: 'Action' },
    { text: 'Stop wishing. Start doing.', category: 'Action' },
    { text: 'You miss 100% of the shots you don\'t take.', category: 'Action' },
    { text: 'Fortune favors the bold.', category: 'Action' }
  ] },
  { day: 363, quotes: [
    { text: 'Get started. The rest will follow.', category: 'Action' },
    { text: 'Do it now. Sometimes later becomes never.', category: 'Action' },
    { text: 'You are what you do not what you say you\'ll do.', category: 'Action' },
    { text: 'Be the hero of your own life.', category: 'Action' },
    { text: 'The path to success is to take massive determined action.', category: 'Action' }
  ] },
  { day: 364, quotes: [
    { text: 'Don\'t wait for opportunity. Create it.', category: 'Action' },
    { text: 'Life rewards those who take action.', category: 'Action' },
    { text: 'Dream it. Believe it. Build it.', category: 'Action' },
    { text: 'Don\'t stop until you\'re proud.', category: 'Action' },
    { text: 'Go the extra mile. It\'s never crowded.', category: 'Action' }
  ] },
  { day: 365, quotes: [
    { text: 'Hard work beats talent when talent doesn\'t work hard.', category: 'Action' },
    { text: 'Opportunities don\'t happen. You create them.', category: 'Action' },
    { text: 'Stay hungry. Stay foolish.', category: 'Action' },
    { text: 'The difference between ordinary and extraordinary is that little extra.', category: 'Action' },
    { text: 'Turn your can\'ts into cans and your dreams into plans.', category: 'Action' }
  ] }
  ];

  /**
   * Get one quote for a given calendar day.
   * variant 0-4 selects which of the 5 quotes for that day to return.
   * Defaults to variant 0 for deterministic daily display.
   */
  export function getDailyQuote(dayOfYear: number, variant: 0 | 1 | 2 | 3 | 4 = 0): QuoteEntry {
    const set = DAILY_QUOTE_SETS[(dayOfYear - 1 + DAILY_QUOTE_SETS.length) % DAILY_QUOTE_SETS.length];
    return set.quotes[variant] ?? set.quotes[0];
  }

  /**
   * Flat array of all 1825 quotes for legacy index-based access.
   * DAILY_QUOTES[0] = Day 1 / Quote 1, DAILY_QUOTES[1] = Day 1 / Quote 2, etc.
   */
  export const DAILY_QUOTES: readonly string[] = DAILY_QUOTE_SETS.flatMap(s => s.quotes.map(q => q.text));
  