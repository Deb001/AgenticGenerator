import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;

import java.time.Duration;
import java.util.Set;

public class TC-Func-SP-1-5_Test {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        // Assuming chromedriver executable is in system PATH
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        driver.get("https://your-application-homepage.com"); // replace with actual URL
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void test_TC_Func_SP_1_5() {
        // Step 1: Google OAuth signup
        // Click the Google sign‑up button
        By googleSignupBtn = By.cssSelector("[data-testid='google-signup']");
        wait.until(ExpectedConditions.elementToBeClickable(googleSignupBtn)).click();

        // Switch to Google consent window
        String mainWindow = driver.getWindowHandle();
        wait.until(driver -> driver.getWindowHandles().size() > 1);
        Set<String> windows = driver.getWindowHandles();
        for (String win : windows) {
            if (!win.equals(mainWindow)) {
                driver.switchTo().window(win);
                break;
            }
        }

        // Enter Google credentials (placeholders – replace with real selectors)
        By emailField = By.cssSelector("[data-testid='identifierId']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailField)).sendKeys("testuser@gmail.com");
        driver.findElement(By.cssSelector("[data-testid='identifierNext']")).click();

        By passwordField = By.cssSelector("[data-testid='password']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordField)).sendKeys("YourPassword123");
        driver.findElement(By.cssSelector("[data-testid='passwordNext']")).click();

        // Authorise the application
        By consentAllowBtn = By.cssSelector("[data-testid='submit_approve_access']");
        wait.until(ExpectedConditions.elementToBeClickable(consentAllowBtn)).click();

        // Return to main application window
        driver.switchTo().window(mainWindow);

        // Verify user is logged in (e.g., avatar appears)
        By userAvatar = By.cssSelector("[data-testid='user-avatar']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(userAvatar));
        Assert.assertTrue(driver.findElement(userAvatar).isDisplayed(),
                "User avatar should be displayed after successful Google login");

        // Step 2: Complete profile
        // Navigate to profile page if needed
        By profileMenu = By.cssSelector("[data-testid='nav-profile']");
        wait.until(ExpectedConditions.elementToBeClickable(profileMenu)).click();

        // Fill investment goals
        By goalsField = By.cssSelector("[data-testid='investment-goals']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(goalsField)).clear();
        driver.findElement(goalsField).sendKeys("Long‑term growth");

        // Select risk tolerance
        By riskDropdown = By.cssSelector("[data-testid='risk-tolerance']");
        wait.until(ExpectedConditions.elementToBeClickable(riskDropdown)).click();
        By riskOption = By.cssSelector("[data-testid='risk-medium']"); // example option
        wait.until(ExpectedConditions.elementToBeClickable(riskOption)).click();

        // Save profile
        By saveProfileBtn = By.cssSelector("[data-testid='save-profile']");
        wait.until(ExpectedConditions.elementToBeClickable(saveProfileBtn)).click();

        // Verify profile data is saved and displayed
        By savedGoals = By.cssSelector("[data-testid='saved-investment-goals']");
        By savedRisk = By.cssSelector("[data-testid='saved-risk-tolerance']");
        wait.until(ExpectedConditions.textToBePresentInElementLocated(savedGoals, "Long‑term growth"));
        wait.until(ExpectedConditions.textToBePresentInElementLocated(savedRisk, "Medium"));
        Assert.assertEquals(driver.findElement(savedGoals).getText(), "Long‑term growth",
                "Investment goals should be saved correctly");
        Assert.assertEquals(driver.findElement(savedRisk).getText(), "Medium",
                "Risk tolerance should be saved correctly");

        // Step 3: Create portfolio named Core
        By createPortfolioBtn = By.cssSelector("[data-testid='create-portfolio']");
        wait.until(ExpectedConditions.elementToBeClickable(createPortfolioBtn)).click();

        By portfolioNameField = By.cssSelector("[data-testid='portfolio-name']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(portfolioNameField)).sendKeys("Core");

        By savePortfolioBtn = By.cssSelector("[data-testid='save-portfolio']");
        wait.until(ExpectedConditions.elementToBeClickable(savePortfolioBtn)).click();

        // Verify portfolio appears in the list
        By portfolioListItem = By.xpath("//div[@data-testid='portfolio-list']//span[text()='Core']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(portfolioListItem));
        Assert.assertTrue(driver.findElement(portfolioListItem).isDisplayed(),
                "Portfolio named 'Core' should be present in the portfolio list");
    }
}