import React from 'react';
import { MapPin, Star, MessageCircle, Heart, Phone, Mail, Globe } from 'lucide-react';

const ListingsGrid = ({ listings, onContactClick, selectedMarker }) => {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-600">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div
          key={listing.id}
          id={`listing-${listing.id}`}
          className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 ${
            selectedMarker?.id === listing.id ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {/* Listing Image */}
          <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
            
            {/* Category Badge */}
            <div className="absolute top-2 left-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {listing.category}
              </span>
            </div>

            {/* Price Badge */}
            {listing.price && (
              <div className="absolute top-2 right-2">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  ${listing.price}/hr
                </span>
              </div>
            )}
          </div>

          {/* Listing Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {listing.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {listing.description}
            </p>

            {/* Location */}
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{listing.location}</span>
            </div>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {listing.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {listing.features.length > 3 && (
                    <span className="text-gray-500 text-xs">+{listing.features.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>4.8</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>{listing._count?.comments || 0}</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                <span>{listing._count?.favorites || 0}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onContactClick(listing, 'phone')}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button
                onClick={() => onContactClick(listing, 'email')}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              {listing.contact?.website && (
                <button
                  onClick={() => window.open(listing.contact.website, '_blank')}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Globe className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingsGrid; 