import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;

import java.time.Duration;
import java.util.List;

public class TC-Func-SP-1-1_Test {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void test_TC_Func_SP_1_1() {
        // Preconditions: Home page loaded
        driver.get("https://example.com"); // replace with actual URL
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='home-page']")));

        // Step 1: Navigate to signup and create account
        driver.findElement(By.cssSelector("[data-testid='nav-signup']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='signup-form']")));

        driver.findElement(By.cssSelector("[data-testid='signup-email']")).sendKeys("testuser@example.com");
        driver.findElement(By.cssSelector("[data-testid='signup-password']")).sendKeys("Str0ngP@ssw0rd!");
        driver.findElement(By.cssSelector("[data-testid='signup-submit']")).click();

        // Expected: account creation confirmation
        WebElement signupSuccess = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='signup-success']")));
        Assert.assertTrue(signupSuccess.isDisplayed(), "Signup success message not displayed");

        // Step 2: Simulate email verification (navigate to verification link)
        // In a real test, retrieve the verification link from email. Here we use a placeholder URL.
        driver.get("https://example.com/verify?token=placeholder");
        WebElement verificationMsg = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='verification-success']")));
        Assert.assertTrue(verificationMsg.isDisplayed(), "Verification success message not displayed");

        // Expected: redirected to login page
        WebElement loginForm = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='login-form']")));
        Assert.assertTrue(loginForm.isDisplayed(), "Login form not displayed after verification");

        // Step 3: Login with verified credentials
        driver.findElement(By.cssSelector("[data-testid='login-email']")).sendKeys("testuser@example.com");
        driver.findElement(By.cssSelector("[data-testid='login-password']")).sendKeys("Str0ngP@ssw0rd!");
        driver.findElement(By.cssSelector("[data-testid='login-submit']")).click();

        // Expected: dashboard displayed
        WebElement dashboard = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='dashboard']")));
        Assert.assertTrue(dashboard.isDisplayed(), "Dashboard not displayed after login");

        // Step 4: Complete profile
        driver.findElement(By.cssSelector("[data-testid='nav-profile']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='profile-form']")));

        driver.findElement(By.cssSelector("[data-testid='investment-goals']")).sendKeys("Retirement");
        driver.findElement(By.cssSelector("[data-testid='risk-tolerance']")).sendKeys("Medium");
        driver.findElement(By.cssSelector("[data-testid='profile-save']")).click();

        // Expected: profile summary reflects entered data
        WebElement profileSummary = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='profile-summary']")));
        String summaryText = profileSummary.getText();
        Assert.assertTrue(summaryText.contains("Retirement"), "Investment goal not saved");
        Assert.assertTrue(summaryText.contains("Medium"), "Risk tolerance not saved");

        // Step 5: Create portfolio named Core
        driver.findElement(By.cssSelector("[data-testid='nav-portfolios']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='portfolio-page']")));

        driver.findElement(By.cssSelector("[data-testid='create-portfolio-button']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='portfolio-name-input']")));
        driver.findElement(By.cssSelector("[data-testid='portfolio-name-input']")).sendKeys("Core");
        driver.findElement(By.cssSelector("[data-testid='portfolio-save']")).click();

        // Expected: Core appears in list
        List<WebElement> portfoliosAfterCore = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("[data-testid='portfolio-item']")));
        boolean coreExists = portfoliosAfterCore.stream()
                .anyMatch(e -> e.getText().contains("Core"));
        Assert.assertTrue(coreExists, "Portfolio 'Core' was not created");

        // Step 6: Create portfolio named Growth
        driver.findElement(By.cssSelector("[data-testid='create-portfolio-button']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='portfolio-name-input']")));
        driver.findElement(By.cssSelector("[data-testid='portfolio-name-input']")).sendKeys("Growth");
        driver.findElement(By.cssSelector("[data-testid='portfolio-save']")).click();

        // Expected: Growth appears alongside Core
        List<WebElement> portfoliosAfterGrowth = wait.until(
                ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector("[data-testid='portfolio-item']")));
        boolean growthExists = portfoliosAfterGrowth.stream()
                .anyMatch(e -> e.getText().contains("Growth"));
        Assert.assertTrue(growthExists, "Portfolio 'Growth' was not created");
        Assert.assertTrue(coreExists, "Portfolio 'Core' disappeared after creating 'Growth'");

        // Postconditions are implicitly verified by the above asserts.
    }
}