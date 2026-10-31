import React from 'react';
import {
  Plane, Briefcase, FileText, ShieldCheck, Clock, Users, Globe, Phone, Mail, MapPin, CheckCircle2,
  Star, Award, HeartHandshake, Stamp, FileCheck, Search, Headphones, BadgeCheck, Compass, Landmark,
  Luggage, CreditCard, Building2, MessageCircle, Sparkles, Target, Eye, Lightbulb, Handshake,
  Facebook, Instagram, Linkedin, Youtube, Twitter, ArrowRight, Menu, X, ChevronDown, Quote, Calendar,
} from 'lucide-react';

export const ICONS = {
  Plane, Briefcase, FileText, ShieldCheck, Clock, Users, Globe, Phone, Mail, MapPin, CheckCircle2, Star,
  Award, HeartHandshake, Stamp, FileCheck, Search, Headphones, BadgeCheck, Compass, Landmark, Luggage,
  CreditCard, Building2, MessageCircle, Sparkles, Target, Eye, Lightbulb, Handshake,
};

export const Icon = ({ name, size = 22, ...rest }) => {
  const C = ICONS[name] || Sparkles;
  return <C size={size} aria-hidden="true" {...rest} />;
};

export { Phone, Mail, MapPin, CheckCircle2, Star, Facebook, Instagram, Linkedin, Youtube, Twitter, ArrowRight, Menu, X, ChevronDown, Quote, Calendar, MessageCircle, Plane, Stamp };
