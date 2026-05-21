-- ==========================================
-- AI ENGLISH LEARNING PLATFORM SCHEMA
-- ==========================================
-- Target: Supabase PostgreSQL (or any PostgreSQL instance)
-- Includes: ENUMs, Tables, Constraints, RLS, Triggers, Indexes & Seed Data

-- -----------------------------------------------------
-- 1. CLEANUP & EXTENSIONS
-- -----------------------------------------------------
-- Enable UUID-OSSP extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects if they exist (clean setup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
DROP TRIGGER IF EXISTS update_faculty_profiles_updated_at ON public.faculty_profiles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

DROP TABLE IF EXISTS public.faculty_profiles CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS english_competency CASCADE;

-- -----------------------------------------------------
-- 2. CUSTOM TYPES / ENUMS
-- -----------------------------------------------------
CREATE TYPE user_role AS ENUM ('student', 'faculty');
CREATE TYPE english_competency AS ENUM ('beginner', 'intermediate', 'advanced');

-- -----------------------------------------------------
-- 3. TABLES
-- -----------------------------------------------------

-- A. Profiles Table (Extends Supabase Auth users or standalone users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    role user_role NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- B. Student Profiles Table
CREATE TABLE public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    section VARCHAR(10) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    english_level english_competency,
    speaking_confidence INTEGER CHECK (speaking_confidence BETWEEN 1 AND 10),
    interests TEXT[] NOT NULL DEFAULT '{}',
    hobbies TEXT[] NOT NULL DEFAULT '{}',
    learning_goal VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- C. Faculty Profiles Table
CREATE TABLE public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE TUNING
-- -----------------------------------------------------
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX idx_student_profiles_roll ON public.student_profiles(roll_number);
CREATE INDEX idx_student_profiles_level ON public.student_profiles(english_level);
CREATE INDEX idx_faculty_profiles_user_id ON public.faculty_profiles(user_id);

-- -----------------------------------------------------
-- 5. TRIGGER FOR AUTOMATIC UPDATED_AT COLUMN
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faculty_profiles_updated_at
    BEFORE UPDATE ON public.faculty_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

-- A. Profiles Policies
-- 1. Anyone (or authenticated users) can view profiles to identify users
CREATE POLICY "Allow public select of profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- 2. Users can only update their own profile
CREATE POLICY "Allow update of own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. System can insert profiles (during auth signup trigger or backend api)
CREATE POLICY "Allow insertion of profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- B. Student Profiles Policies
-- 1. Students can view their own profile, Faculty can view all student profiles
CREATE POLICY "View student profiles policy"
    ON public.student_profiles FOR SELECT
    USING (
        auth.uid() = user_id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'faculty'
    );

-- 2. Students can insert/update their own profile
CREATE POLICY "Manage own student profile"
    ON public.student_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- C. Faculty Profiles Policies
-- 1. Faculty can view all faculty profiles (or authenticated users can read designations)
CREATE POLICY "View faculty profiles policy"
    ON public.faculty_profiles FOR SELECT
    USING (true);

-- 2. Faculty can insert/update their own profile
CREATE POLICY "Manage own faculty profile"
    ON public.faculty_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- 7. SUPABASE AUTOMATED AUTH TRIGGER (OPTIONAL / PRODUCTION)
-- -----------------------------------------------------
-- Automatically copies users from Supabase auth.users to public.profiles
-- Note: Commented out by default in case deployment is purely backend-driven.
-- If deploying to Supabase directly, run this to sync Supabase Auth automatically.
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, onboarding_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

-- -----------------------------------------------------
-- 8. ANALYTICS & SEED DATA (For testing and local verification)
-- -----------------------------------------------------
-- We populate sample data for testing role-based dashboards.
-- Seed values assume some standard UUIDs.

-- Insert 1 Faculty Profile
INSERT INTO public.profiles (id, role, full_name, email, avatar_url, onboarding_completed)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'faculty', 'Dr. Sarah Jenkins', 'sarah.faculty@college.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', true);

INSERT INTO public.faculty_profiles (user_id, college_name, department, designation)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'State Institute of Engineering', 'English and Humanities', 'Professor & Head');

-- Insert 3 Student Profiles
INSERT INTO public.profiles (id, role, full_name, email, avatar_url, onboarding_completed)
VALUES 
('e0000000-0000-0000-0000-000000000001', 'student', 'Alex Rivera', 'alex.student@college.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', true),
('e0000000-0000-0000-0000-000000000002', 'student', 'Priya Sharma', 'priya.student@college.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', true),
('e0000000-0000-0000-0000-000000000003', 'student', 'Ethan Hunt', 'ethan.student@college.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ethan', false);

-- Alex (Advanced Student)
INSERT INTO public.student_profiles (user_id, college_name, department, section, roll_number, english_level, speaking_confidence, interests, hobbies, learning_goal)
VALUES 
('e0000000-0000-0000-0000-000000000001', 'State Institute of Engineering', 'Computer Science', 'A', 'CS-2024-042', 'advanced', 8, ARRAY['AI', 'Coding', 'Technology'], ARRAY['Chess', 'Writing'], 'Crack Interviews');

-- Priya (Intermediate Student)
INSERT INTO public.student_profiles (user_id, college_name, department, section, roll_number, english_level, speaking_confidence, interests, hobbies, learning_goal)
VALUES 
('e0000000-0000-0000-0000-000000000002', 'State Institute of Engineering', 'Electronics & Comm.', 'B', 'EC-2024-099', 'intermediate', 5, ARRAY['Public Speaking', 'Movies', 'Entrepreneurship'], ARRAY['Music', 'Traveling'], 'Improve Speaking');

-- Note: Ethan is registered but has onboarding_completed = false, so he doesn't have a student_profiles row yet.
