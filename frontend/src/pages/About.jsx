const About = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About QuickCourt</h1>
          <p className="text-xl text-gray-600">
            Revolutionizing sports facility booking across India
          </p>
        </div>    
        <div className="prose prose-lg mx-auto">
          <p>
            QuickCourt is India's leading sports facility booking platform, connecting sports 
            enthusiasts with premium courts and facilities across the country. Founded with the 
            vision of making sports more accessible, we've simplified the process of finding 
            and booking sports facilities.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            To democratize access to sports facilities and promote an active lifestyle by 
            providing a seamless booking experience for players and facility owners alike.
          </p>
          
          <h2>Why Choose Us?</h2>
          <ul>
            <li>Largest network of verified sports facilities</li>
            <li>Real-time availability and instant booking</li>
            <li>Secure payment processing</li>
            <li>24/7 customer support</li>
            <li>Best price guarantee</li>
          </ul>
          
          <h2>Our Impact</h2>
          <p>
            Since our launch, we've facilitated over 50,000 bookings across 25+ cities, 
            helping thousands of sports enthusiasts find their perfect playing venue.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About



