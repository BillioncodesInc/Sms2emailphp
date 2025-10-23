#!/usr/bin/env python3
"""
Redirector Toolkit - All-in-One Solution

A comprehensive, beautiful CLI tool for processing redirector URLs with
batch processing and single link generation capabilities.

Author: Redirector Toolkit
Version: 4.0
"""

import sys
import re
import subprocess
import os
import tempfile
import argparse
import urllib.parse
from datetime import datetime

# ANSI Color Codes
class Colors:
    """ANSI color codes for terminal output"""
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    UNDERLINE = '\033[4m'
    
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'

class Icons:
    """Unicode icons for better visual feedback"""
    CHECK = '✓'
    CROSS = '✗'
    ARROW = '→'
    BULLET = '•'
    STAR = '★'
    GEAR = '⚙'
    ROCKET = '🚀'
    PACKAGE = '📦'
    LINK = '🔗'
    SHIELD = '🛡️'
    FIRE = '🔥'
    CLOCK = '⏱️'
    MAGNIFY = '🔍'
    WARNING = '⚠️'
    INFO = 'ℹ️'
    SPARKLES = '✨'
    TARGET = '🎯'

def disable_colors():
    """Disable all colors"""
    for attr in dir(Colors):
        if not attr.startswith('_'):
            setattr(Colors, attr, '')

def print_banner(mode='main'):
    """Print a colorful banner"""
    if mode == 'batch':
        title = "BATCH PROCESSOR"
        subtitle = "Process Large Lists of Redirector URLs"
    elif mode == 'generate':
        title = "LINK GENERATOR"
        subtitle = "Create Obfuscated Links with Ease"
    else:
        title = "REDIRECTOR TOOLKIT"
        subtitle = "Your Complete URL Processing Solution"
    
    banner = f"""
{Colors.BRIGHT_CYAN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║              {Icons.ROCKET}  {title:^28}  {Icons.ROCKET}              ║
║                                                                      ║
║          {Colors.BRIGHT_YELLOW}{subtitle:^46}{Colors.BRIGHT_CYAN}          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
{Colors.RESET}
"""
    print(banner)

def print_section(title, icon=''):
    """Print a section header"""
    line = '─' * 70
    print(f"\n{Colors.BRIGHT_BLUE}{Colors.BOLD}{line}{Colors.RESET}")
    print(f"{Colors.BRIGHT_WHITE}{Colors.BOLD}{icon} {title}{Colors.RESET}")
    print(f"{Colors.BRIGHT_BLUE}{line}{Colors.RESET}\n")

def print_step(step_num, total_steps, description):
    """Print a processing step with progress indicator"""
    percentage = int((step_num / total_steps) * 100)
    bar_length = 30
    filled = int((percentage / 100) * bar_length)
    bar = '█' * filled + '░' * (bar_length - filled)
    
    print(f"{Colors.BRIGHT_CYAN}{Colors.BOLD}[{step_num}/{total_steps}]{Colors.RESET} "
          f"{Colors.BRIGHT_WHITE}{description}{Colors.RESET}")
    print(f"     {Colors.BRIGHT_BLUE}[{bar}]{Colors.RESET} {Colors.BRIGHT_YELLOW}{percentage}%{Colors.RESET}")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.BRIGHT_GREEN}{Colors.BOLD}{Icons.CHECK} {message}{Colors.RESET}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.BRIGHT_RED}{Colors.BOLD}{Icons.CROSS} {message}{Colors.RESET}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.BRIGHT_YELLOW}{Colors.BOLD}{Icons.WARNING} {message}{Colors.RESET}")

def print_info(message):
    """Print an info message"""
    print(f"{Colors.BRIGHT_CYAN}{Icons.INFO} {message}{Colors.RESET}")

def print_stat(label, value, color=Colors.BRIGHT_WHITE):
    """Print a statistic"""
    print(f"  {Colors.BRIGHT_BLACK}{Icons.ARROW}{Colors.RESET} "
          f"{Colors.WHITE}{label}:{Colors.RESET} "
          f"{color}{Colors.BOLD}{value}{Colors.RESET}")

def print_box(content, color=Colors.BRIGHT_CYAN, title=None):
    """Print content in a box"""
    lines = content.split('\n')
    max_width = max(len(line) for line in lines) if lines else 0
    width = min(max_width + 4, 70)
    
    print(f"\n{color}┌{'─' * (width - 2)}┐{Colors.RESET}")
    if title:
        print(f"{color}│{Colors.RESET} {Colors.BOLD}{title}{Colors.RESET}{' ' * (width - len(title) - 3)}{color}│{Colors.RESET}")
        print(f"{color}├{'─' * (width - 2)}┤{Colors.RESET}")
    
    for line in lines:
        padding = width - len(line) - 3
        print(f"{color}│{Colors.RESET} {line}{' ' * padding}{color}│{Colors.RESET}")
    
    print(f"{color}└{'─' * (width - 2)}┘{Colors.RESET}\n")

def print_analysis_item(label, status=True):
    """Print analysis item with check/cross"""
    icon = f"{Colors.BRIGHT_GREEN}{Icons.CHECK}{Colors.RESET}" if status else f"{Colors.BRIGHT_RED}{Icons.CROSS}{Colors.RESET}"
    print(f"  {icon} {Colors.WHITE}{label}{Colors.RESET}")

# ============================================================================
# BATCH PROCESSING FUNCTIONS
# ============================================================================

def extract_urls_with_redirect_params(input_file, output_file):
    """Extract URLs with redirect parameters"""
    print_step(1, 5, "Extracting URLs with redirect parameters")
    
    extracted_count = 0
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile, \
         open(output_file, 'w', encoding='utf-8') as outfile:
        
        for line in infile:
            line = line.strip()
            if not line:
                continue
            
            # Remove ID field if separated by pipe
            if '|' in line:
                parts = line.split('|')
                if len(parts) >= 2:
                    line = parts[1].strip()
            
            # Check if line contains redirect parameter pattern
            if '=http' in line:
                outfile.write(line + '\n')
                extracted_count += 1
    
    print_stat("Extracted URLs", extracted_count, Colors.BRIGHT_GREEN)
    return extracted_count

def replace_redirect_targets(input_file, output_file):
    """Replace redirect targets with example.com"""
    print_step(2, 5, "Replacing redirect targets with test domain")
    
    replaced_count = 0
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile, \
         open(output_file, 'w', encoding='utf-8') as outfile:
        
        for line in infile:
            modified_line = re.sub(r'=https?://', r'=https://example.com%23', line)
            outfile.write(modified_line)
            if modified_line != line:
                replaced_count += 1
    
    print_stat("Replaced targets", replaced_count, Colors.BRIGHT_GREEN)
    return replaced_count

def check_alive_redirectors(input_file, output_file):
    """Check which redirectors are still alive"""
    print_step(3, 5, "Validating redirector availability (ffuf)")
    
    # Check if ffuf is installed
    try:
        subprocess.run(['ffuf', '-h'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    except FileNotFoundError:
        print_warning("ffuf not installed - skipping validation")
        print_info("Install: apt install golang-go && go install github.com/ffuf/ffuf/v2@latest")
        
        with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
            outfile.write(infile.read())
        return 0
    
    # Run ffuf
    try:
        cmd = [
            'ffuf', '-w', input_file, '-u', 'FUZZ', '-r',
            '-mr', 'Example Domain', '-o', output_file, '-of', 'csv',
            '-timeout', '2', '-t', '20', '-s'
        ]
        
        subprocess.run(cmd, capture_output=True, text=True)
        
        if os.path.exists(output_file):
            with open(output_file, 'r') as f:
                count = max(0, len(f.readlines()) - 1)
                print_stat("Working redirectors", count, Colors.BRIGHT_GREEN)
                return count
        else:
            print_warning("No working redirectors found")
            return 0
            
    except Exception as e:
        print_error(f"ffuf error: {e}")
        with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
            outfile.write(infile.read())
        return 0

def extract_urls_from_csv(input_file, output_file):
    """Extract and sort URLs from results"""
    print_step(4, 5, "Extracting and sorting results")
    
    urls = set()
    
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile:
        first_line = infile.readline()
        infile.seek(0)
        
        is_csv = ',' in first_line and ('url' in first_line.lower() or 'status' in first_line.lower())
        
        for i, line in enumerate(infile):
            if is_csv and i == 0:
                continue
            
            line = line.strip()
            if not line:
                continue
            
            if is_csv:
                parts = line.split(',')
                if len(parts) >= 2:
                    url = parts[1].strip('"').strip()
                    if url:
                        urls.add(url)
            else:
                urls.add(line)
    
    sorted_urls = sorted(urls)
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for url in sorted_urls:
            outfile.write(url + '\n')
    
    print_stat("Sorted unique URLs", len(sorted_urls), Colors.BRIGHT_GREEN)
    return len(sorted_urls)

def apply_obfuscation(url):
    """Apply URL obfuscation techniques"""
    url = url.lstrip('/')
    
    if '/' in url:
        domain_part, path_part = url.split('/', 1)
        path_part = '/' + path_part
    else:
        domain_part = url
        path_part = ''
    
    domain_obfuscated = domain_part.replace('.', '%252e')
    domain_with_port = domain_obfuscated + ':00443'
    obfuscated_url = '//' + domain_with_port + path_part
    
    return obfuscated_url

def process_url_batch(url, shortener=None, obfuscate=False):
    """Process a single URL for batch mode"""
    url = url.strip()
    
    if shortener:
        shortener_url = f"//{shortener}/{{{{short_code}}}}?{{{{params}}}}"
        
        if obfuscate:
            shortener_url = apply_obfuscation(shortener_url)
        
        cleaned = re.sub(r'https://example\.com[^&]*', shortener_url, url)
    else:
        cleaned = re.sub(r'https://example\.com[^&]*', r'{{url}}', url)
    
    return cleaned

def remove_domain_duplicates(input_file, output_file, shortener=None, obfuscate=False):
    """Remove domain duplicates and apply enhancements"""
    print_step(5, 5, "Removing duplicates and applying enhancements")
    
    if shortener:
        print_info(f"Integrating shortener: {Colors.BRIGHT_YELLOW}{shortener}{Colors.RESET}")
    if obfuscate:
        print_info(f"Applying obfuscation: {Colors.BRIGHT_YELLOW}ENABLED{Colors.RESET}")
    
    unique_count = 0
    
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile, \
         open(output_file, 'w', encoding='utf-8') as outfile:
        
        prev = infile.readline()
        
        while True:
            next_line = infile.readline()
            
            if not next_line:
                if prev:
                    cleaned = process_url_batch(prev, shortener, obfuscate)
                    if not cleaned.endswith('\n'):
                        cleaned += '\n'
                    outfile.write(cleaned)
                    unique_count += 1
                break
            
            if len(next_line) >= 20 and len(prev) >= 20:
                if next_line[0:20] not in prev:
                    cleaned = process_url_batch(prev, shortener, obfuscate)
                    if not cleaned.endswith('\n'):
                        cleaned += '\n'
                    outfile.write(cleaned)
                    unique_count += 1
            elif next_line[0:20] not in prev:
                cleaned = process_url_batch(prev, shortener, obfuscate)
                if not cleaned.endswith('\n'):
                    cleaned += '\n'
                outfile.write(cleaned)
                unique_count += 1
            
            prev = next_line
    
    print_stat("Final unique redirectors", unique_count, Colors.BRIGHT_GREEN)
    return unique_count

def print_batch_summary(stats):
    """Print batch processing summary"""
    print_section("Processing Summary", Icons.SPARKLES)
    
    print(f"{Colors.BRIGHT_WHITE}{Colors.BOLD}Results:{Colors.RESET}")
    print_stat("Input URLs", stats.get('input', 0), Colors.BRIGHT_CYAN)
    print_stat("Extracted", stats.get('extracted', 0), Colors.BRIGHT_CYAN)
    print_stat("Validated", stats.get('validated', 'N/A'), Colors.BRIGHT_CYAN)
    print_stat("Final Output", stats.get('output', 0), Colors.BRIGHT_GREEN)
    
    if stats.get('shortener'):
        print(f"\n{Colors.BRIGHT_WHITE}{Colors.BOLD}Enhancements:{Colors.RESET}")
        print_stat("Shortener", stats['shortener'], Colors.BRIGHT_YELLOW)
        print_stat("Obfuscation", "Enabled" if stats.get('obfuscate') else "Disabled", 
                  Colors.BRIGHT_YELLOW if stats.get('obfuscate') else Colors.BRIGHT_BLACK)
    
    print(f"\n{Colors.BRIGHT_WHITE}{Colors.BOLD}Output:{Colors.RESET}")
    print_stat("File", stats.get('output_file', 'N/A'), Colors.BRIGHT_CYAN)
    
    duration = stats.get('duration', 0)
    print_stat("Duration", f"{duration:.2f}s", Colors.BRIGHT_MAGENTA)

def batch_process(input_file, output_file, shortener=None, obfuscate=False):
    """Main batch processing function"""
    start_time = datetime.now()
    
    print_banner('batch')
    
    # Check input file
    if not os.path.exists(input_file):
        print_error(f"Input file not found: {input_file}")
        return False
    
    # Print configuration
    print_section("Configuration", Icons.GEAR)
    print_stat("Input file", input_file, Colors.BRIGHT_CYAN)
    print_stat("Output file", output_file, Colors.BRIGHT_CYAN)
    if shortener:
        print_stat("Shortener", shortener, Colors.BRIGHT_YELLOW)
    print_stat("Obfuscation", "Enabled" if obfuscate else "Disabled", 
              Colors.BRIGHT_YELLOW if obfuscate else Colors.BRIGHT_BLACK)
    
    # Count input lines
    with open(input_file, 'r') as f:
        input_count = sum(1 for line in f if line.strip())
    
    print_stat("Input URLs", input_count, Colors.BRIGHT_CYAN)
    
    # Processing
    print_section("Processing", Icons.ROCKET)
    
    stats = {'input': input_count}
    
    temp_dir = tempfile.mkdtemp()
    temp_extracted = os.path.join(temp_dir, 'extracted.txt')
    temp_prepared = os.path.join(temp_dir, 'prepared.txt')
    temp_tested = os.path.join(temp_dir, 'tested.csv')
    temp_sorted = os.path.join(temp_dir, 'sorted.txt')
    
    try:
        stats['extracted'] = extract_urls_with_redirect_params(input_file, temp_extracted)
        stats['replaced'] = replace_redirect_targets(temp_extracted, temp_prepared)
        stats['validated'] = check_alive_redirectors(temp_prepared, temp_tested)
        stats['sorted'] = extract_urls_from_csv(temp_tested, temp_sorted)
        stats['output'] = remove_domain_duplicates(temp_sorted, output_file, 
                                                   shortener, obfuscate)
        
        stats['shortener'] = shortener
        stats['obfuscate'] = obfuscate
        stats['output_file'] = output_file
        stats['duration'] = (datetime.now() - start_time).total_seconds()
        
        print_batch_summary(stats)
        
        print(f"\n{Colors.BRIGHT_GREEN}{Colors.BOLD}{Icons.CHECK} Processing complete!{Colors.RESET}\n")
        return True
        
    except Exception as e:
        print_error(f"Processing failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        import shutil
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

# ============================================================================
# LINK GENERATION FUNCTIONS
# ============================================================================

def integrate_with_target(redirector_url, target_url, shortener_url=None, params_dict=None, obfuscate=False):
    """
    Integrate target URL with optional shortener and parameters
    """
    # Build the target URL with parameters
    if params_dict:
        param_string = '&'.join([f"{k}={v}" for k, v in params_dict.items()])
        if '?' in target_url:
            target_with_params = f"{target_url}&{param_string}"
        else:
            target_with_params = f"{target_url}?{param_string}"
    else:
        target_with_params = target_url
    
    # If shortener is provided, use it; otherwise use target directly
    if shortener_url:
        shortener_url = shortener_url.replace('https://', '').replace('http://', '')
        
        if obfuscate:
            final_target = apply_obfuscation(shortener_url)
        else:
            final_target = f"//{shortener_url}"
    else:
        # Use target URL directly
        target_clean = target_with_params.replace('https://', '').replace('http://', '')
        if obfuscate:
            final_target = apply_obfuscation(target_clean)
        else:
            final_target = f"//{target_clean}"
    
    # Replace {{url}} in redirector
    final_url = redirector_url.replace('{{url}}', final_target)
    return final_url, target_with_params

def parse_params(param_list):
    """Parse parameter list into dictionary"""
    params_dict = {}
    for param in param_list:
        if '=' in param:
            key, value = param.split('=', 1)
            params_dict[key] = value
    return params_dict

def generate_html_link(url, display_text=None):
    """Generate HTML anchor tag"""
    if not display_text:
        display_text = url.replace('https://', '///')
    
    html = f'<a href="{url}"><u>{display_text}</u></a>'
    return html

def generate_link(redirector, target, shortener=None, params=None, obfuscate=False, html=False, display_text=None):
    """Main link generation function"""
    start_time = datetime.now()
    
    print_banner('generate')
    
    # Configuration
    print_section("Configuration", Icons.GEAR)
    print_stat("Redirector", redirector[:50] + "..." if len(redirector) > 50 else redirector, 
              Colors.BRIGHT_CYAN)
    print_stat("Target URL", target, Colors.BRIGHT_GREEN)
    
    if shortener:
        print_stat("Shortener", shortener, Colors.BRIGHT_YELLOW)
        print(f"    {Colors.BRIGHT_BLACK}{Icons.INFO} Shortener should point to: {target}{Colors.RESET}")
    
    params_dict = parse_params(params) if params else {}
    if params_dict:
        print_stat("Parameters", len(params_dict), Colors.BRIGHT_MAGENTA)
        for key, value in params_dict.items():
            print(f"    {Colors.BRIGHT_BLACK}{Icons.BULLET}{Colors.RESET} "
                  f"{Colors.WHITE}{key}{Colors.RESET} = "
                  f"{Colors.BRIGHT_YELLOW}{value}{Colors.RESET}")
    
    print_stat("Obfuscation", "ENABLED" if obfuscate else "DISABLED",
              Colors.BRIGHT_GREEN if obfuscate else Colors.BRIGHT_BLACK)
    print_stat("HTML Output", "Yes" if html else "No",
              Colors.BRIGHT_GREEN if html else Colors.BRIGHT_BLACK)
    
    # Generate link
    print_section("Generating Link", Icons.ROCKET)
    
    try:
        final_url, target_with_params = integrate_with_target(
            redirector,
            target,
            shortener,
            params_dict,
            obfuscate
        )
        
        # Display target URL (what the user will actually reach)
        if params_dict:
            print_section("Final Target URL", Icons.TARGET)
            print_box(target_with_params, Colors.BRIGHT_GREEN)
        
        # Display result
        print_section("Generated Redirector URL", Icons.SPARKLES)
        print_box(final_url, Colors.BRIGHT_CYAN)
        
        # HTML output
        if html:
            html_link = generate_html_link(final_url, display_text)
            print_section("HTML Anchor Tag", Icons.PACKAGE)
            print_box(html_link, Colors.BRIGHT_MAGENTA)
        
        # Analysis
        print_section("Analysis", Icons.SHIELD)
        
        if shortener:
            print(f"{Colors.BRIGHT_WHITE}{Colors.BOLD}URL Chain:{Colors.RESET}")
            print_analysis_item(f"User clicks: Redirector URL")
            print_analysis_item(f"Redirects to: Shortener ({shortener})")
            print_analysis_item(f"Shortener redirects to: {target}")
            if params_dict:
                print_analysis_item(f"With parameters: {len(params_dict)} parameter(s)")
        else:
            print(f"{Colors.BRIGHT_WHITE}{Colors.BOLD}URL Chain:{Colors.RESET}")
            print_analysis_item(f"User clicks: Redirector URL")
            print_analysis_item(f"Redirects directly to: {target}")
            if params_dict:
                print_analysis_item(f"With parameters: {len(params_dict)} parameter(s)")
        
        if obfuscate:
            print(f"\n{Colors.BRIGHT_WHITE}{Colors.BOLD}Obfuscation Applied:{Colors.RESET}")
            print_analysis_item("Protocol removed (using //)")
            print_analysis_item("Domain dots encoded (%252e)")
            print_analysis_item("Port with leading zeros (:00443)")
        
        # Summary
        duration = (datetime.now() - start_time).total_seconds()
        print(f"\n{Colors.BRIGHT_WHITE}{Colors.BOLD}Summary:{Colors.RESET}")
        print_stat("Final URL Length", len(final_url), Colors.BRIGHT_CYAN)
        if params_dict:
            print_stat("Target URL Length", len(target_with_params), Colors.BRIGHT_CYAN)
        print_stat("Generation Time", f"{duration:.3f}s", Colors.BRIGHT_MAGENTA)
        
        print(f"\n{Colors.BRIGHT_GREEN}{Colors.BOLD}{Icons.CHECK} Link generated successfully!{Colors.RESET}\n")
        return True
        
    except Exception as e:
        print(f"\n{Colors.BRIGHT_RED}{Colors.BOLD}{Icons.CROSS} Error: {e}{Colors.RESET}\n")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Redirector Toolkit - All-in-One Solution',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
{Colors.BRIGHT_CYAN}Modes:{Colors.RESET}
  {Colors.WHITE}batch{Colors.RESET}     Process large lists of redirector URLs
  {Colors.WHITE}generate{Colors.RESET}  Create a single obfuscated link

{Colors.BRIGHT_CYAN}Examples:{Colors.RESET}
  {Colors.WHITE}# Batch processing{Colors.RESET}
  python3 redirector_toolkit.py batch input.txt output.txt
  python3 redirector_toolkit.py batch input.txt output.txt -s tinyurl.com -o
  
  {Colors.WHITE}# Link generation{Colors.RESET}
  python3 redirector_toolkit.py generate \\
      -r "https://tags.bluekai.com/site/35702?redir={{{{url}}}}" \\
      -t "https://mywebsite.com/offer"
  
  python3 redirector_toolkit.py generate \\
      -r "REDIRECTOR" -t "TARGET" \\
      -s "tinyurl.com/abc123" \\
      -p "email=john@example.com" "campaign=spring" \\
      -o --html
        """
    )
    
    subparsers = parser.add_subparsers(dest='mode', help='Operation mode')
    
    # Batch processing subcommand
    batch_parser = subparsers.add_parser('batch', help='Batch process redirector URLs')
    batch_parser.add_argument('input_file', help='Input file with redirector URLs')
    batch_parser.add_argument('output_file', help='Output file for processed URLs')
    batch_parser.add_argument('-s', '--shortener', help='URL shortener domain')
    batch_parser.add_argument('-o', '--obfuscate', action='store_true', help='Apply obfuscation')
    batch_parser.add_argument('--no-color', action='store_true', help='Disable colored output')
    
    # Link generation subcommand
    gen_parser = subparsers.add_parser('generate', help='Generate a single obfuscated link')
    gen_parser.add_argument('-r', '--redirector', required=True,
                           help='Redirector URL with {{url}} placeholder')
    gen_parser.add_argument('-t', '--target', required=True,
                           help='Target URL (your actual destination link)')
    gen_parser.add_argument('-s', '--shortener',
                           help='URL shortener address (optional)')
    gen_parser.add_argument('-p', '--params', nargs='*', default=[],
                           help='Parameters (format: key=value)')
    gen_parser.add_argument('-o', '--obfuscate', action='store_true',
                           help='Apply obfuscation')
    gen_parser.add_argument('--html', action='store_true',
                           help='Generate HTML anchor tag')
    gen_parser.add_argument('-d', '--display-text',
                           help='Custom display text for HTML')
    gen_parser.add_argument('--no-color', action='store_true',
                           help='Disable colored output')
    
    args = parser.parse_args()
    
    # Show help if no mode specified
    if not args.mode:
        parser.print_help()
        sys.exit(0)
    
    # Disable colors if requested
    if hasattr(args, 'no_color') and args.no_color:
        disable_colors()
    
    # Execute based on mode
    if args.mode == 'batch':
        success = batch_process(
            args.input_file,
            args.output_file,
            args.shortener,
            args.obfuscate
        )
        sys.exit(0 if success else 1)
    
    elif args.mode == 'generate':
        success = generate_link(
            args.redirector,
            args.target,
            args.shortener,
            args.params,
            args.obfuscate,
            args.html,
            args.display_text
        )
        sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()

